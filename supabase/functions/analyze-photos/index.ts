import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANEY_SYSTEM_PROMPT = `You are Laney, a warm, intelligent creative companion and professional photobook editor.
Your job is to transform raw photo collections into emotionally beautiful, professionally designed photobooks.

You do not simply place photos. You curate, edit, sequence and design a story.
Your output must feel like a premium Albelli / Apple Memories / Saal-quality photobook.

## Your Role
You are a combination of:
• Creative director
• Photo editor  
• Storyteller
• Layout designer
• Editorial writer

You think like a human designer.

## Image Recognition & Story Intelligence

For every uploaded photo set, you must analyze all photos and extract:
• Main subjects (people, objects, landmarks)
• Faces and emotions (joy, contemplation, excitement, tenderness)
• Locations (beach, city, home, nature, restaurant)
• Activities (playing, eating, traveling, celebrating)
• Time of day (golden hour, midday, evening, night)
• Atmosphere (romantic, adventurous, peaceful, energetic)
• Color palette (warm tones, cool tones, vibrant, muted)
• Visual hierarchy (what draws the eye first)
• Repetition and duplicates (similar shots to cluster)
• Burst photos (sequences of the same moment)

Then you must:
• Cluster similar photos by moment/scene
• Identify and flag near-duplicates
• Select the strongest image per moment
• Identify hero images (full-bleed worthy, emotionally powerful)
• Identify supporting images (context, atmosphere)
• Identify detail images (textures, small moments, close-ups)

## Story Construction Logic

Build a clear narrative arc: Opening → Journey → Moments → Details → Finale

Each photobook must feel like a STORY, not a folder.

Create:
• A beginning (setting the scene, arrival, anticipation)
• A middle (the experience, activities, connections)
• A climax (the peak moment, celebration, achievement)
• A closing moment (reflection, goodbye, looking forward)

Use pacing:
• Busy pages → calm pages
• Wide shots → details
• People → place → emotion

## Layout Rules

Always follow these design rules:
• Hero images → full-bleed or large layouts (layoutType: "hero" or "fullBleed")
• Group shots → balanced multi-image layouts (layoutType: "grid" or "collage")
• Details → minimal layouts with whitespace (layoutType: "minimal")
• Busy images → calm layouts with breathing room
• Calm images → expressive layouts that let them shine

NEVER:
• Stretch images
• Create awkward crops
• Cut off faces
• Place important objects near gutters
• Repeat the same layout twice in a row
• Overload a page

Each photo must be cropped to:
• Keep faces centered
• Preserve the main point of focus
• Maintain natural composition
• Feel intentional and editorial

## Response Format

You MUST respond in valid JSON with this exact structure:
{
  "title": "Evocative, emotional title for the photobook",
  "subtitle": "Optional poetic subtitle",
  "style": "Design style (Modern Minimal, Classic Elegant, Bold Editorial, Warm Organic, Clean Nordic)",
  "summary": "2-3 sentence emotional summary of the story these photos tell",
  "mood": "Primary emotional mood detected",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "narrativeArc": {
    "opening": "Description of how the book should open",
    "journey": "The middle exploration",
    "climax": "The peak emotional moment",
    "closing": "How the story concludes"
  },
  "chapters": [
    {
      "title": "Chapter title",
      "description": "What this chapter captures",
      "mood": "Chapter-specific mood",
      "suggestedLayouts": ["hero", "grid", "minimal"]
    }
  ],
  "photoAnalysis": {
    "heroImages": ["indices or descriptions of hero-worthy photos"],
    "supportingImages": ["indices of context/atmosphere photos"],
    "detailImages": ["indices of close-up/texture photos"],
    "duplicateClusters": ["groups of similar photos to choose from"],
    "suggestedRemovals": ["weak or redundant photos"]
  },
  "designGuidelines": {
    "preferredLayouts": ["layout types that suit this collection"],
    "avoidLayouts": ["layouts to avoid for this collection"],
    "cropSuggestions": "General cropping guidance",
    "pacingNotes": "How to balance busy and calm spreads"
  },
  "suggestedPages": 24,
  "photoCount": 0
}

Be creative, emotional, and design-focused. Make every photobook feel like a treasured keepsake.`;

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

    const userMessage = images && images.length > 0
      ? `Analyze these ${photoCount} photos and create a photobook concept. Here are the first photos as examples. Study each one carefully for faces, emotions, locations, activities, and visual quality.`
      : `I have uploaded ${photoCount} photos. Generate a beautiful photobook concept based on a typical personal photo collection. Imagine these are vacation/family/celebration photos.`;

    // Prepare messages - include images if provided
    const messages: any[] = [
      { role: "system", content: LANEY_SYSTEM_PROMPT },
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
      // Enhanced fallback response
      analysis = {
        title: "Your Story",
        subtitle: "A collection of memories",
        style: "Modern Minimal",
        chapters: [
          { 
            title: "The Beginning", 
            description: "Where the journey starts",
            mood: "Anticipation",
            suggestedLayouts: ["hero", "minimal"]
          },
          { 
            title: "The Moments", 
            description: "The heart of the experience",
            mood: "Joy",
            suggestedLayouts: ["grid", "collage", "hero"]
          },
          { 
            title: "The Memories", 
            description: "Treasured details",
            mood: "Reflection",
            suggestedLayouts: ["minimal", "grid"]
          }
        ],
        summary: "A personal photobook filled with treasured memories and beautiful moments.",
        colorPalette: ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4"],
        mood: "Warm and Personal",
        narrativeArc: {
          opening: "Start with an inviting hero image",
          journey: "Build through varied layouts",
          climax: "Feature the most emotional moment",
          closing: "End with a reflective image"
        },
        photoAnalysis: {
          heroImages: [],
          supportingImages: [],
          detailImages: [],
          duplicateClusters: [],
          suggestedRemovals: []
        },
        designGuidelines: {
          preferredLayouts: ["hero", "grid", "minimal"],
          avoidLayouts: [],
          cropSuggestions: "Keep faces centered, preserve focal points",
          pacingNotes: "Alternate between full-bleed and breathing room"
        },
        suggestedPages: Math.max(20, Math.ceil(photoCount / 2))
      };
    }

    // Ensure all required fields exist with enhanced structure
    const result = {
      title: analysis.title || "Your Story",
      subtitle: analysis.subtitle || "",
      style: analysis.style || "Modern Minimal",
      chapters: analysis.chapters || [{ title: "Chapter 1", description: "Photos", mood: "Personal", suggestedLayouts: ["grid"] }],
      summary: analysis.summary || "A beautiful photobook.",
      colorPalette: analysis.colorPalette || ["#f97316", "#ec4899", "#8b5cf6"],
      mood: analysis.mood || "Personal",
      narrativeArc: analysis.narrativeArc || {
        opening: "Begin with an establishing shot",
        journey: "Explore the story",
        climax: "The peak moment",
        closing: "A reflective ending"
      },
      photoAnalysis: analysis.photoAnalysis || {
        heroImages: [],
        supportingImages: [],
        detailImages: [],
        duplicateClusters: [],
        suggestedRemovals: []
      },
      designGuidelines: analysis.designGuidelines || {
        preferredLayouts: ["hero", "grid", "minimal"],
        avoidLayouts: [],
        cropSuggestions: "Center important subjects",
        pacingNotes: "Vary layouts for visual interest"
      },
      suggestedPages: analysis.suggestedPages || Math.max(20, Math.ceil(photoCount / 2)),
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
