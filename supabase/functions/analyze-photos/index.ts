import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, photoCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for photo analysis
    const systemPrompt = `Je bent Laney AI, een expert in het analyseren van foto's voor fotoboeken. 
Analyseer de aangeleverde foto's en genereer een fotoboek concept.

Je moet ALTIJD antwoorden in JSON formaat met de volgende structuur:
{
  "title": "Een pakkende titel voor het fotoboek (in het Nederlands)",
  "style": "De aanbevolen stijl (bijv. Modern Minimaal, Klassiek Elegant, Speels, Warm & Gezellig)",
  "chapters": [
    {
      "title": "Hoofdstuk titel",
      "description": "Korte beschrijving van dit hoofdstuk"
    }
  ],
  "summary": "Een samenvattende beschrijving van het fotoboek concept (2-3 zinnen)",
  "colorPalette": ["#kleurcode1", "#kleurcode2", "#kleurcode3"],
  "mood": "De algemene stemming/sfeer gedetecteerd in de foto's",
  "suggestedPages": een getal voor het aantal aanbevolen pagina's
}

Wees creatief en maak het persoonlijk op basis van wat je in de foto's ziet.`;

    const userMessage = images && images.length > 0
      ? `Analyseer deze ${photoCount} foto's en maak een fotoboek concept. Hier zijn de eerste foto's als voorbeelden:`
      : `Ik heb ${photoCount} foto's geüpload. Genereer een passend fotoboek concept gebaseerd op een typische collectie persoonlijke foto's.`;

    // Prepare messages - include images if provided
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (images && images.length > 0) {
      // Include base64 images for multimodal analysis
      const imageContents = images.slice(0, 4).map((img: string) => ({
        type: "image_url",
        image_url: { url: img }
      }));
      
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userMessage },
          ...imageContents
        ]
      });
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback response
      analysis = {
        title: "Mijn Fotoboek",
        style: "Modern Minimaal",
        chapters: [
          { title: "Herinneringen", description: "Een verzameling van mooie momenten" }
        ],
        summary: "Een persoonlijk fotoboek vol bijzondere herinneringen.",
        colorPalette: ["#f97316", "#ec4899", "#8b5cf6"],
        mood: "Warm en persoonlijk",
        suggestedPages: Math.max(16, Math.ceil(photoCount / 2))
      };
    }

    // Ensure all required fields exist
    const result = {
      title: analysis.title || "Mijn Fotoboek",
      style: analysis.style || "Modern Minimaal",
      chapters: analysis.chapters || [{ title: "Hoofdstuk 1", description: "Foto's" }],
      summary: analysis.summary || "Een prachtig fotoboek.",
      colorPalette: analysis.colorPalette || ["#f97316", "#ec4899"],
      mood: analysis.mood || "Persoonlijk",
      suggestedPages: analysis.suggestedPages || Math.max(16, Math.ceil(photoCount / 2)),
      photoCount: photoCount
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-photos error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
