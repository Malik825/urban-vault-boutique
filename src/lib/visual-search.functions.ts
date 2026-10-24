import { createServerFn } from "@tanstack/react-start";
import { getAdminClient } from "@/lib/admin.functions";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { STORE, CATEGORIES_TAXONOMY } from "@/lib/store-data";

export interface VisualMatchResult {
  product: CatalogProduct;
  score: number; // 0 - 100
  matchReason: string;
}

export interface VisualAnalysis {
  detectedCategory: string;
  department: string;
  itemType: string;
  colors: string[];
  styleTags: string[];
}

export interface SourcingRequestData {
  customerName: string;
  whatsappNumber: string;
  preferredSize?: string | undefined;
  budget?: string | undefined;
  notes?: string | undefined;
  imageUrl?: string | undefined;
  imageBase64?: string | undefined;
}

// ─── Automated Visual Search Server Function ──────────────────────────────────

export const searchSimilarProducts = createServerFn({ method: "POST" })
  .validator(
    (data: {
      imageBase64?: string | undefined;
      imageUrl?: string | undefined;
      hintCategory?: string | undefined;
      clientDetectedColors?: string[] | undefined;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ matches: VisualMatchResult[]; analysis: VisualAnalysis }> => {
    // 1. Fetch available published products
    const catalog = await listPublishedProducts();

    // 2. Multimodal AI Analysis with Gemini, GitHub Models (GPT-4o-mini), Grok (xAI), Hugging Face, or OpenRouter
    const geminiKey =
      process.env["GEMINI_API_KEY"] ||
      process.env["VITE_GEMINI_API_KEY"] ||
      process.env["GOOGLE_AI_KEY"];
    const githubToken = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
    const xaiKey = process.env["XAI_API_KEY"] || process.env["GROK_API_KEY"];
    const hfToken = process.env["HF_TOKEN"] || process.env["HUGGINGFACE_TOKEN"];
    const openRouterKey = process.env["OPENROUTER_API_KEY"];

    let analysis: VisualAnalysis | null = null;

    const fashionPrompt = `You are a fashion retail visual search AI for "Urban Vault", a high-end streetwear and unisex boutique in Ghana.
Analyze this fashion product photo and respond ONLY with a raw JSON object (no markdown, no backticks, no explanations) matching this exact format:
{
  "detectedCategory": "Tops & Shirts" | "Denim & Jeans" | "Outerwear & Jackets" | "Footwear & Sneakers" | "Bottoms & Shorts" | "Luxury Hoodies & Sweats" | "Accessories & Bags" | "Caps & Headwear" | "Jewelry & Watches" | "Fragrances & Grooming",
  "department": "Men" | "Women" | "Unisex",
  "itemType": "e.g. Graphic Tee / Chunky Sneaker / Cargo Pants / Cuban Shirt / Hoodie",
  "colors": ["Primary Color", "Secondary Color"],
  "styleTags": ["tag1", "tag2", "tag3", "tag4"]
}`;

    if (data.imageBase64) {
      const cleanBase64 = data.imageBase64.includes(",")
        ? (data.imageBase64.split(",")[1] ?? data.imageBase64)
        : data.imageBase64;
      const mimeMatch = data.imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const mimeType = mimeMatch && mimeMatch[1] ? mimeMatch[1] : "image/jpeg";
      const fullDataUri = `data:${mimeType};base64,${cleanBase64}`;

      // A. Try Gemini 1.5 Flash (Google AI Studio Free Tier)
      if (geminiKey && !analysis) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: fashionPrompt },
                      {
                        inline_data: {
                          mime_type: mimeType,
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 500,
                },
              }),
            },
          );

          if (response.ok) {
            const resJson: any = await response.json();
            const rawText: string =
              resJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(cleaned);
          }
        } catch (err) {
          console.warn("[searchSimilarProducts] Gemini Vision error, checking alternatives:", err);
        }
      }

      // B. Try GitHub Models (Free OpenAI GPT-4o-mini Vision with GitHub Personal Access Token)
      if (githubToken && !analysis) {
        try {
          const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${githubToken}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: fashionPrompt },
                    { type: "image_url", image_url: { url: fullDataUri } },
                  ],
                },
              ],
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (response.ok) {
            const resJson: any = await response.json();
            const rawText: string = resJson?.choices?.[0]?.message?.content?.trim() || "";
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(cleaned);
          }
        } catch (err) {
          console.warn("[searchSimilarProducts] GitHub Models error, checking alternatives:", err);
        }
      }

      // C. Try Grok (xAI API)
      if (xaiKey && !analysis) {
        try {
          const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${xaiKey}`,
            },
            body: JSON.stringify({
              model: "grok-2-vision-1212",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: fashionPrompt },
                    { type: "image_url", image_url: { url: fullDataUri } },
                  ],
                },
              ],
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (response.ok) {
            const resJson: any = await response.json();
            const rawText: string = resJson?.choices?.[0]?.message?.content?.trim() || "";
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(cleaned);
          }
        } catch (err) {
          console.warn("[searchSimilarProducts] Grok (xAI) error, checking alternatives:", err);
        }
      }

      // D. Try Hugging Face Serverless Vision API
      if (hfToken && !analysis) {
        try {
          const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-VL-7B-Instruct/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${hfToken}`,
              },
              body: JSON.stringify({
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: fashionPrompt },
                      { type: "image_url", image_url: { url: fullDataUri } },
                    ],
                  },
                ],
                temperature: 0.2,
                max_tokens: 500,
              }),
            },
          );

          if (response.ok) {
            const resJson: any = await response.json();
            const rawText: string = resJson?.choices?.[0]?.message?.content?.trim() || "";
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(cleaned);
          }
        } catch (err) {
          console.warn("[searchSimilarProducts] Hugging Face error, checking alternatives:", err);
        }
      }

      // E. Try OpenRouter Free Vision (openrouter/free)
      if (openRouterKey && !analysis) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
            },
            body: JSON.stringify({
              model: "openrouter/free",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: fashionPrompt },
                    { type: "image_url", image_url: { url: fullDataUri } },
                  ],
                },
              ],
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (response.ok) {
            const resJson: any = await response.json();
            const rawText: string = resJson?.choices?.[0]?.message?.content?.trim() || "";
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(cleaned);
          }
        } catch (err) {
          console.warn("[searchSimilarProducts] OpenRouter error, falling back to heuristic:", err);
        }
      }
    }

    // 3. Fallback Heuristic Analysis if AI API is not active or gave no output
    if (!analysis) {
      const hint = data.hintCategory || "";
      const matchedTax = CATEGORIES_TAXONOMY.find(
        (c) => c.name.toLowerCase() === hint.toLowerCase() || c.id === hint.toLowerCase(),
      );

      const detectedColors =
        data.clientDetectedColors && data.clientDetectedColors.length > 0
          ? data.clientDetectedColors
          : ["Black", "White", "Earth Tone"];

      analysis = {
        detectedCategory: matchedTax?.name || "Tops & Shirts",
        department: "Unisex",
        itemType: hint || "Boutique Streetwear Item",
        colors: detectedColors,
        styleTags: ["streetwear", "oversized", "boutique", "urban", "luxury"],
      };
    }

    // 4. Rank catalogue items based on attributes
    const targetCat = analysis.detectedCategory.toLowerCase();
    const targetTags = analysis.styleTags.map((t) => t.toLowerCase());
    const targetColors = analysis.colors.map((c) => c.toLowerCase());
    const targetItem = analysis.itemType.toLowerCase();

    const scored = catalog.map((product) => {
      let score = 50; // base potential
      const reasons: string[] = [];

      // Category match (+30 pts)
      if (product.category.toLowerCase() === targetCat) {
        score += 30;
        reasons.push(product.category);
      } else if (
        product.category.toLowerCase().includes(targetCat) ||
        targetCat.includes(product.category.toLowerCase())
      ) {
        score += 20;
        reasons.push("Related Category");
      }

      // Name & Blurb keywords (+20 pts)
      const pText = `${product.name} ${product.brand} ${product.blurb || ""}`.toLowerCase();
      let matchedTagCount = 0;
      for (const tag of targetTags) {
        if (pText.includes(tag)) matchedTagCount++;
      }
      if (targetItem && pText.includes(targetItem)) {
        score += 15;
        reasons.push(analysis.itemType);
      }
      if (matchedTagCount > 0) {
        score += Math.min(15, matchedTagCount * 5);
        reasons.push("Style match");
      }

      // Color check in specs (+10 pts)
      const specs = (product.specs as Record<string, any>) || {};
      const colorSpec = (specs["Color"] || "").toString().toLowerCase();
      for (const col of targetColors) {
        if (colorSpec.includes(col) || pText.includes(col)) {
          score += 10;
          reasons.push(`${col.charAt(0).toUpperCase() + col.slice(1)} tone`);
          break;
        }
      }

      // Cap score between 65% and 98%
      const finalScore = Math.min(98, Math.max(68, score));
      const reasonText = reasons.length > 0 ? reasons.slice(0, 2).join(" • ") : "Silhouette & Style";

      return {
        product,
        score: finalScore,
        matchReason: reasonText,
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return {
      matches: scored.slice(0, 8),
      analysis,
    };
  });

// ─── Customer Sourcing Concierge Server Function ──────────────────────────────

export const submitSourcingRequest = createServerFn({ method: "POST" })
  .validator((data: SourcingRequestData) => data)
  .handler(async ({ data }) => {
    let publicImageUrl = data.imageUrl || "";

    // 1. If base64 was provided, upload to Supabase storage under `sourcing/`
    if (data.imageBase64 && !publicImageUrl) {
      try {
        const supabase = getAdminClient();
        const cleanBase64 = data.imageBase64.includes(",")
          ? (data.imageBase64.split(",")[1] ?? "")
          : data.imageBase64;
        const buffer = Buffer.from(cleanBase64, "base64");
        const fileName = `sourcing_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.jpg`;
        const path = `sourcing/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, buffer, { contentType: "image/jpeg", upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);
          publicImageUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.warn("[submitSourcingRequest] Image upload warning:", err);
      }
    }

    // 2. Try saving to Supabase `sourcing_requests` table if it exists
    let requestId = `SR-${Date.now().toString().slice(-6)}`;
    try {
      const supabase = getAdminClient() as any;
      const { data: inserted, error: dbError } = await supabase
        .from("sourcing_requests")
        .insert({
          customer_name: data.customerName,
          whatsapp_number: data.whatsappNumber,
          preferred_size: data.preferredSize || null,
          budget: data.budget || null,
          notes: data.notes || null,
          image_url: publicImageUrl || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (!dbError && inserted?.id) {
        requestId = inserted.id;
      }
    } catch {
      // Table may not exist yet, continue gracefully
    }

    // 3. Build WhatsApp Direct Concierge link
    const lines = [
      `*🌟 NEW SOURCING REQUEST — ${STORE.name}*`,
      `*Request ID:* #${requestId}`,
      `*Customer:* ${data.customerName}`,
      `*WhatsApp:* ${data.whatsappNumber}`,
      data.preferredSize ? `*Size:* ${data.preferredSize}` : "",
      data.budget ? `*Budget:* GH₵ ${data.budget}` : "",
      data.notes ? `*Notes:* ${data.notes}` : "",
      publicImageUrl ? `*Photo:* ${publicImageUrl}` : "",
      `\n_Hi ${STORE.name}, I'm looking for this item. Can you help me find or source it?_`,
    ].filter(Boolean);

    const waText = encodeURIComponent(lines.join("\n"));
    const whatsappUrl = `https://wa.me/${STORE.whatsappRaw}?text=${waText}`;

    return {
      ok: true,
      requestId,
      imageUrl: publicImageUrl,
      whatsappUrl,
    };
  });

// ─── Admin List Sourcing Requests ─────────────────────────────────────────────

export const adminListSourcingRequests = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getAdminClient() as any;
    const { data, error } = await supabase
      .from("sourcing_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});
