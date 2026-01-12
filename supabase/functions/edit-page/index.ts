import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, page, allPhotos, analysis } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== "string") {
      return jsonResponse({ error: "Missing prompt" }, 400);
    }

    if (!page || typeof page !== "object" || !Array.isArray(page.elements) || !page.background) {
      return jsonResponse({ error: "Missing or invalid page" }, 400);
    }

    const safeAllPhotos = Array.isArray(allPhotos) ? allPhotos : [];
    const pagePhotoSrcs = Array.isArray(page.elements)
      ? page.elements
          .filter((el: any) => el?.type === "photo" && typeof el?.src === "string")
          .map((el: any) => el.src as string)
      : [];

    const userMessage = `User request: ${prompt}

Current page JSON:
${JSON.stringify(page)}

Available photos (allowed src values):
${JSON.stringify(safeAllPhotos)}

High-level analysis context (optional):
${JSON.stringify(analysis ?? null)}

Remember: edit ONLY this page. Return JSON only.`;

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

    const allowedSrc = new Set<string>([...safeAllPhotos, ...pagePhotoSrcs]);
    const originalSrcByElementId = new Map<string, string>();
    for (const el of page.elements) {
      if (el?.type === "photo" && typeof el?.id === "string" && typeof el?.src === "string") {
        originalSrcByElementId.set(el.id, el.src);
      }
    }
    for (const el of nextPage.elements) {
      if (el?.type === "photo" && typeof el.src === "string") {
        if (!allowedSrc.has(el.src)) {
          const original = typeof el?.id === "string" ? originalSrcByElementId.get(el.id) : undefined;
          el.src = original ?? allowedSrc.values().next().value ?? el.src;
        }
      }
    }

    return jsonResponse({ page: nextPage }, 200);
  } catch (error) {
    console.error("edit-page failed:", error);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
