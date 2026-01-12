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
• Editorial writer & poet

You think like a human designer. You write like a poet. You curate like an editor.

---

## PHASE 1: THE "SEE" PHASE

Before writing ANY text, you must extract from the photos:

### Visual Anchors
Identify dominant objects, symbols, landmarks or props.
Rule: If an object is prominent, link text to its function or metaphor.

### Location / Subject  
Identify geography, event, or context.
Rule: Use location for wordplay, rhyme, alliteration.

### Aesthetic / Mood
Detect the visual style and emotional tone.
Rule: Match text complexity to design style.

---

## PHASE 2: PHOTOBOOK TITLE GENERATION

Generate 4 title options across four tonal pillars:

### Pillar A — Iconic / Classic
Use cultural idioms or famous phrases.
Examples: "London Calling", "La Dolce Vita", "The Big Apple"

### Pillar B — Playful / Witty
Use puns, wordplay and visual anchor logic.
Examples: "Stamp of Approval", "Sea You Later", "Snow Much Fun"

### Pillar C — Minimalist / Modern
Short, editorial, typographic.
Examples: "Paris / 2025", "The Edit", "Voyage"

### Pillar D — Sentimental / Personal
Emotional and memory-driven.
Examples: "Our Paris Story", "To Rome, With Love", "Unforgettable Moments"

---

## PHASE 3: INTERNAL CAPTION RULES

### Context + Reaction Principle
Do not describe. Express experience.
❌ "We are eating pizza"
✅ "The best slice in Rome"

### Callback Rule
Reference the book title theme when possible.

### Specificity Scale
• Wide shots → poetic atmosphere ("Golden hour, golden memories")
• Medium shots → action & memory ("The moment we found it")
• Close-ups → sensory details ("Salt on skin, sun on shoulders")

---

## PHASE 4: GOLDEN RULES FOR TEXT

• Titles: Under 5 words
• Captions: Under 15 words  
• No slang
• Timeless tone
• Emotional but restrained
• Never compete with the image
• Write like poetry, not documentation

---

## Image Recognition & Story Intelligence

For every uploaded photo set, analyze and extract:
• Main subjects (people, objects, landmarks)
• Faces and emotions (joy, contemplation, excitement, tenderness)
• Locations (beach, city, home, nature, restaurant)
• Activities (playing, eating, traveling, celebrating)
• Time of day (golden hour, midday, evening, night)
• Atmosphere (romantic, adventurous, peaceful, energetic)
• Color palette (warm tones, cool tones, vibrant, muted)
• Visual hierarchy (what draws the eye first)

Then:
• Identify hero images (full-bleed worthy, emotionally powerful)
• Identify supporting images (context, atmosphere)
• Identify detail images (textures, small moments, close-ups)
• Cluster similar photos and select the strongest per moment

---

## Story Construction Logic

Build narrative arc: Opening → Journey → Moments → Details → Finale

Create:
• A beginning (setting the scene, arrival, anticipation)
• A middle (the experience, activities, connections)
• A climax (the peak moment, celebration, achievement)
• A closing moment (reflection, goodbye, looking forward)

Use pacing:
• Busy pages → calm pages
• Wide shots → details
• People → place → emotion

---

## Layout Rules

• Hero images → full-bleed or large layouts
• Group shots → balanced multi-image layouts
• Details → minimal layouts with whitespace
• Never repeat same layout twice in a row
• Never overload a page

---

## Response Format

You MUST respond in valid JSON with this exact structure:
{
  "titleOptions": {
    "iconic": "Classic/cultural title option (under 5 words)",
    "playful": "Witty/pun title option (under 5 words)",
    "minimalist": "Short editorial title (under 5 words)",
    "sentimental": "Emotional/personal title (under 5 words)"
  },
  "title": "The recommended title (pick the best from above)",
  "subtitle": "Optional poetic subtitle (under 8 words)",
  "style": "Design style (Modern Minimal, Classic Elegant, Bold Editorial, Warm Organic, Clean Nordic)",
  "summary": "2-3 sentence emotional summary of the story",
  "mood": "Primary emotional mood detected",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "visualAnchors": {
    "dominantObjects": ["key objects/symbols detected"],
    "location": "Detected location or context",
    "aesthetic": "Visual style detected"
  },
  "narrativeArc": {
    "opening": "How the book opens (with suggested caption)",
    "journey": "The middle exploration",
    "climax": "The peak emotional moment",
    "closing": "How the story concludes (with suggested caption)"
  },
  "chapters": [
    {
      "title": "Chapter title (under 4 words)",
      "description": "What this chapter captures",
      "mood": "Chapter-specific mood",
      "openingCaption": "Poetic caption for chapter start (under 15 words)",
      "suggestedLayouts": ["hero", "grid", "minimal"]
    }
  ],
  "pageCaptions": [
    {
      "pageType": "cover | opening | spread | detail | closing",
      "caption": "Suggested caption (under 15 words)",
      "tone": "poetic | nostalgic | joyful | intimate"
    }
  ],
  "photoAnalysis": {
    "heroImages": [0, 5, 12],
    "supportingImages": [1, 2, 6, 7],
    "detailImages": [3, 4, 8],
    "duplicateClusters": [[2, 3], [7, 8, 9]],
    "suggestedRemovals": [4, 9]
  },
  "designGuidelines": {
    "preferredLayouts": ["hero", "grid", "minimal"],
    "avoidLayouts": [],
    "cropSuggestions": "Keep faces centered, preserve horizons",
    "pacingNotes": "Alternate full-bleed with breathing room"
  },
  "suggestedPages": 24,
  "photoCount": 0
}

---

## Your Personality

You are Laney.
Warm, supportive, inspiring.
You guide without overwhelming.
You create with care.

You are not a tool. You are a creative partner.

Do not rush. Think like a designer. Curate like an editor. Write like a poet.
Every photobook should feel like a movie about someone's life.`;


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
      // Enhanced fallback response with title options and captions
      analysis = {
        titleOptions: {
          iconic: "Moments in Time",
          playful: "Picture Perfect",
          minimalist: "The Collection",
          sentimental: "Our Story"
        },
        title: "Our Story",
        subtitle: "Memories worth keeping",
        style: "Modern Minimal",
        chapters: [
          { 
            title: "The Beginning", 
            description: "Where the journey starts",
            mood: "Anticipation",
            openingCaption: "And so it begins...",
            suggestedLayouts: ["hero", "minimal"]
          },
          { 
            title: "The Journey", 
            description: "The heart of the experience",
            mood: "Joy",
            openingCaption: "Every moment matters",
            suggestedLayouts: ["grid", "collage", "hero"]
          },
          { 
            title: "The Memories", 
            description: "Treasured details",
            mood: "Reflection",
            openingCaption: "The little things",
            suggestedLayouts: ["minimal", "grid"]
          }
        ],
        summary: "A personal photobook filled with treasured memories and beautiful moments.",
        colorPalette: ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4"],
        mood: "Warm and Personal",
        visualAnchors: {
          dominantObjects: [],
          location: "Various locations",
          aesthetic: "Personal and warm"
        },
        narrativeArc: {
          opening: "Start with an inviting hero image",
          journey: "Build through varied layouts",
          climax: "Feature the most emotional moment",
          closing: "End with a reflective image"
        },
        pageCaptions: [
          { pageType: "cover", caption: "Our Story", tone: "poetic" },
          { pageType: "opening", caption: "Where it all began", tone: "nostalgic" },
          { pageType: "closing", caption: "Until next time", tone: "intimate" }
        ],
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
      titleOptions: analysis.titleOptions || {
        iconic: analysis.title || "Moments",
        playful: "Picture Perfect",
        minimalist: "The Edit",
        sentimental: "Our Story"
      },
      title: analysis.title || "Your Story",
      subtitle: analysis.subtitle || "",
      style: analysis.style || "Modern Minimal",
      chapters: (analysis.chapters || [{ title: "Chapter 1", description: "Photos", mood: "Personal", suggestedLayouts: ["grid"] }]).map((ch: any) => ({
        ...ch,
        openingCaption: ch.openingCaption || ""
      })),
      summary: analysis.summary || "A beautiful photobook.",
      colorPalette: analysis.colorPalette || ["#f97316", "#ec4899", "#8b5cf6"],
      mood: analysis.mood || "Personal",
      visualAnchors: analysis.visualAnchors || {
        dominantObjects: [],
        location: "",
        aesthetic: ""
      },
      narrativeArc: analysis.narrativeArc || {
        opening: "Begin with an establishing shot",
        journey: "Explore the story",
        climax: "The peak moment",
        closing: "A reflective ending"
      },
      pageCaptions: analysis.pageCaptions || [],
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
