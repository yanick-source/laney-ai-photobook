import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_EDIT_SYSTEM_PROMPT = `You are Laney, a warm, intelligent creative companion and professional photobook editor.

You are helping a user edit ONE SINGLE photobook page inside an editor.

CRITICAL SAFETY RULES:
- You must ONLY modify the provided page object.
- You must NEVER reference or modify any other pages or the overall book.
- You must ONLY use photo src values that already exist in the provided allPhotos list OR already exist on the page.
- You must preserve the page's narrative intent; enhance, do not overwrite.
- All edits must be reasonable and reversible (small deltas preferred).

CAPABILITIES (page-scoped):
- Visual style changes: brighter/warmer/more modern/minimal/summery.
- Smarter cropping & composition: adjust cropX/cropY/cropWidth/cropHeight; adjust x/y/width/height.
- Photo swaps: replace photo src with another from allPhotos.
- Layout refinements: adjust element positions/sizes; optionally change layoutId.
- Text edits: refine copy, tone, insert tasteful quotes that match the mood.

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown) in this exact shape:
{
  "page": {
    "id": "(keep as-is)",
    "elements": [ ... ],
    "background": { "type": "solid|gradient|image", "value": "...", "secondaryValue"?: "...", "gradientAngle"?: number },
    "layoutId"?: "..."
  }
}

Do not include any other keys. Do not include explanations.`;

// Input validation constants
const MAX_PROMPT_LENGTH = 500;
const MAX_ELEMENTS = 50;
const MAX_PHOTOS = 100;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Helper to create a short reference for base64 photos
function createPhotoRef(src: string, index: number): string {
  if (src.startsWith("data:")) {
    return `photo_${index}`;
  }
  return src;
}

// Strip base64 data from elements for AI context (keep structure only)
function sanitizePageForAI(page: any, photoMap: Map<string, string>): any {
  const sanitizedElements = page.elements.map((el: any, i: number) => {
    if (el?.type === "photo" && typeof el?.src === "string") {
      const ref = createPhotoRef(el.src, i);
      photoMap.set(ref, el.src); // Store mapping for later
      return {
        ...el,
        src: ref, // Replace base64 with short reference
      };
    }
    return el;
  });
  return { ...page, elements: sanitizedElements };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Invalid or expired token" }, 401);
    }

    const userId = user.id;
    console.log(`[edit-page] User: ${userId}`);

    const { prompt, page, allPhotos, analysis } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return jsonResponse({ error: "Missing or invalid prompt" }, 400);
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return jsonResponse({ error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters` }, 400);
    }

    // Sanitize prompt - remove potential injection attempts
    const sanitizedPrompt = prompt
      .replace(/[<>]/g, "") // Remove angle brackets
      .substring(0, MAX_PROMPT_LENGTH);

    // Validate page structure
    if (!page || typeof page !== "object" || !Array.isArray(page.elements) || !page.background) {
      return jsonResponse({ error: "Missing or invalid page" }, 400);
    }

    if (page.elements.length > MAX_ELEMENTS) {
      return jsonResponse({ error: `Page cannot have more than ${MAX_ELEMENTS} elements` }, 400);
    }

    // Validate allPhotos array
    if (allPhotos !== undefined && !Array.isArray(allPhotos)) {
      return jsonResponse({ error: "allPhotos must be an array" }, 400);
    }

    if (Array.isArray(allPhotos) && allPhotos.length > MAX_PHOTOS) {
      return jsonResponse({ error: `Cannot process more than ${MAX_PHOTOS} photos` }, 400);
    }

    console.log(`[edit-page] Processing: prompt="${sanitizedPrompt.substring(0, 50)}...", elements=${page.elements.length}`);

    // Create photo reference map (ref -> original src)
    const photoMap = new Map<string, string>();
    
    // Sanitize page - replace base64 with references
    const sanitizedPage = sanitizePageForAI(page, photoMap);
    
    // Create refs for allPhotos too
    const safeAllPhotos = Array.isArray(allPhotos) ? allPhotos : [];
    const photoRefs = safeAllPhotos.map((src: string, i: number) => {
      const ref = createPhotoRef(src, i + 1000); // Offset to avoid collision
      photoMap.set(ref, src);
      return ref;
    });

    // Simplify analysis to reduce tokens
    const simplifiedAnalysis = analysis ? {
      title: analysis.title,
      narrativeArc: analysis.narrativeArc,
      visualAnchors: analysis.visualAnchors,
    } : null;

    const userMessage = `User request: ${sanitizedPrompt}

Current page JSON (photo srcs are references, not actual data):
${JSON.stringify(sanitizedPage)}

Available photo references you can use:
${JSON.stringify(photoRefs)}

Context:
${JSON.stringify(simplifiedAnalysis)}

Remember: edit ONLY this page. Return JSON only. Use the photo references as-is in your response.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PAGE_EDIT_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limit exceeded. Please try again later." }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI credits exhausted. Please add credits in Settings." }, 402);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return jsonResponse({ error: `AI gateway error: ${response.status}` }, 500);
    }

    const aiResponse = await response.json();
    const content = aiResponse?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return jsonResponse({ page }, 200);
    }

    let parsed: any;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsed = JSON.parse(jsonStr);
    } catch (_e) {
      console.error("Failed to parse AI response:", content);
      return jsonResponse({ page }, 200);
    }

    const nextPage = parsed?.page;
    if (!nextPage || !Array.isArray(nextPage.elements) || !nextPage.background) {
      return jsonResponse({ page }, 200);
    }

    // Restore original photo sources from references
    for (const el of nextPage.elements) {
      if (el?.type === "photo" && typeof el.src === "string") {
        // Check if src is a reference we created
        const originalSrc = photoMap.get(el.src);
        if (originalSrc) {
          el.src = originalSrc;
        } else {
          // If AI returned unknown ref, try to find original by element ID
          const originalEl = page.elements.find((orig: any) => orig?.id === el.id && orig?.type === "photo");
          if (originalEl?.src) {
            el.src = originalEl.src;
          }
        }
      }
    }

    console.log(`[edit-page] Success for user ${userId}`);

    return jsonResponse({ page: nextPage }, 200);
  } catch (error) {
    console.error("edit-page failed:", error);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
