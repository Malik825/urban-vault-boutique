import { createServerFn } from "@tanstack/react-start";

export interface GenerateProductDescriptionInput {
  title: string;
  category?: string;
  department?: string;
  styleNotes?: string;
}

export interface GenerateCategoryBlurbInput {
  name: string;
  department?: string;
}

// ─── Editorial Boutique Template Fallback Generator ──────────────────────────

const FABRIC_VIBES: Record<string, string[]> = {
  tops: [
    "Crafted from premium 280 GSM heavyweight combed cotton with a signature soft-washed handle.",
    "Tailored from breathable, ultra-soft luxury cotton that keeps its crisp drape all day.",
    "Engineered with a relaxed drop-shoulder silhouette and reinforced ribbed collar that resists stretching.",
  ],
  shirts: [
    "Tailored in a relaxed Cuban collar profile with silky-soft breathable weave and custom tonal buttons.",
    "Features a sharp contemporary silhouette with lightweight, airy drape built for warm climate luxury.",
    "Finished with subtle mother-of-pearl buttons, clean chest stitching, and an effortless fluid fall.",
  ],
  dresses: [
    "Cut in a figure-enhancing silhouette that flows gracefully from daytime lounge to evening occasions.",
    "Designed with an understated luxury cut, premium stretch-infused blend, and clean architectural lines.",
    "A statement piece featuring thoughtful contouring and a breathable, ultra-flattering drape.",
  ],
  sets: [
    "Coordinated two-piece ensemble offering effortless versatility when worn together or styled as separates.",
    "Crafted for bold monochrome or patterned styling with premium elasticated waistband and matching silhouette.",
    "The ultimate grab-and-go luxury pairing featuring immaculate tailoring and effortless comfort.",
  ],
  bottoms: [
    "Constructed from durable heavyweight cotton twill with deep utilitarian pockets and tailored leg profile.",
    "Offers a relaxed yet structured fit with clean ankle break, custom hardware, and reinforced stress points.",
    "Designed for all-day streetwear versatility with a tailored waistband and ergonomic leg taper.",
  ],
  traditional: [
    "Exquisite modern African tailoring with precision geometric embroidery and premium polished cotton fabric.",
    "A distinguished silhouette marrying stately heritage craftsmanship with contemporary minimalist lines.",
    "Crafted for high-profile celebrations, church services, and VIP cultural gatherings with regal distinction.",
  ],
  footwear: [
    "Engineered with premium supple leather, responsive cushioned footbed, and durable high-traction outsole.",
    "A versatile boutique silhouette marrying contemporary sneakerhead aesthetics with all-day arch support.",
  ],
  accessories: [
    "Crafted with meticulous attention to detail, durable statement hardware, and refined boutique branding.",
    "The ideal finishing touch designed to instantly anchor and elevate any contemporary streetwear outfit.",
  ],
};

const STYLING_TIPS = [
  "Style with chunky retro sneakers and minimal silver jewelry for an elevated everyday streetwear rotation.",
  "Pair with tailored trousers or structured shorts for a versatile day-to-night transition.",
  "Throw on an oversized flannel or statement jacket to layer up with effortless contemporary poise.",
  "Team with relaxed cargos and clean kicks to capture the signature Urban Vault aesthetic.",
];

function generateCuratedDescription(input: GenerateProductDescriptionInput): string {
  const title = input.title.trim();
  const lower = `${title} ${input.category || ""} ${input.department || ""}`.toLowerCase();

  let vibeCategory = "tops";
  if (lower.includes("shirt") || lower.includes("cuban") || lower.includes("button")) {
    vibeCategory = "shirts";
  } else if (lower.includes("dress") || lower.includes("skirt")) {
    vibeCategory = "dresses";
  } else if (lower.includes("two piece") || lower.includes("2 piece") || lower.includes("set") || lower.includes("co-ord")) {
    vibeCategory = "sets";
  } else if (lower.includes("pant") || lower.includes("trouser") || lower.includes("cargo") || lower.includes("jean") || lower.includes("bottom")) {
    vibeCategory = "bottoms";
  } else if (lower.includes("kaftan") || lower.includes("traditional") || lower.includes("kente") || lower.includes("agbada")) {
    vibeCategory = "traditional";
  } else if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("footwear") || lower.includes("slide")) {
    vibeCategory = "footwear";
  } else if (lower.includes("bag") || lower.includes("cap") || lower.includes("chain") || lower.includes("watch") || lower.includes("fragrance")) {
    vibeCategory = "accessories";
  }

  const vibes = FABRIC_VIBES[vibeCategory] || FABRIC_VIBES["tops"];
  const fabricSentence = vibes[Math.floor(Math.random() * vibes.length)];
  const styleSentence = STYLING_TIPS[Math.floor(Math.random() * STYLING_TIPS.length)];

  const deptTag = input.department && input.department !== "All" ? ` for the modern ${input.department.toLowerCase()}` : " for bold individual expression";

  return `The ${title} is an essential boutique statement piece crafted${deptTag}. ${fabricSentence} ${styleSentence}`;
}

function generateCuratedBlurb(input: GenerateCategoryBlurbInput): string {
  const name = input.name.trim();
  const lower = name.toLowerCase();

  if (lower.includes("round neck") || lower.includes("tee") || lower.includes("top")) {
    return "Heavyweight boxy tees, washed graphics, and essential minimal tops engineered for everyday elevation.";
  }
  if (lower.includes("short sleeve") || lower.includes("cuban")) {
    return "Breathable Cuban collar shirts, bold resort prints, and fluid button-downs for tropical luxury.";
  }
  if (lower.includes("long sleeve")) {
    return "Tailored button-downs, oversized overshirts, and textured long sleeves for refined layering.";
  }
  if (lower.includes("two piece") || lower.includes("co-ord") || lower.includes("set")) {
    return "Effortless matching co-ords, coordinated twin sets, and versatile day-to-night duos.";
  }
  if (lower.includes("dress")) {
    return "Statement straight dresses, short silhouettes, and 2-piece ensembles tailored for contemporary poise.";
  }
  if (lower.includes("skirt")) {
    return "Flowing maxi skirts, structured pleated profiles, and paired tops designed for bold feminine expression.";
  }
  if (lower.includes("traditional") || lower.includes("kaftan")) {
    return "Regal Ghanaian kaftans, modern heritage embroidery, and distinguished tailored occasion wear.";
  }
  if (lower.includes("bottom") || lower.includes("trouser") || lower.includes("cargo")) {
    return "Relaxed utility cargos, pleated trousers, and structured streetwear denim with clean silhouettes.";
  }
  if (lower.includes("footwear") || lower.includes("sneaker")) {
    return "Curated designer sneakers, premium leather slides, and statement footwear built for comfort.";
  }
  if (lower.includes("bag") || lower.includes("luggage")) {
    return "Luxury crossbody bags, travel duffels, and minimalist clutches with premium hardware.";
  }
  if (lower.includes("jewelry") || lower.includes("timepiece")) {
    return "Statement link chains, iced pendants, and refined timepieces that anchor any luxury outfit.";
  }

  return `Curated ${name.toLowerCase()} showcasing boutique tailoring, premium fabrics, and contemporary streetwear styling.`;
}

// ─── Hugging Face Helper ──────────────────────────────────────────────────────

async function callHuggingFace(prompt: string, maxTokens = 150): Promise<string | null> {
  const hfToken = process.env["HF_TOKEN"] || process.env["HUGGINGFACE_TOKEN"];
  if (!hfToken) return null;

  const models = [
    "Qwen/Qwen2.5-7B-Instruct",
    "meta-llama/Llama-3.2-3B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hfToken}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an editorial copywriter for Urban Vault, an exclusive unisex streetwear and fashion boutique in Ghana. Write elegant, concise, high-converting product descriptions (2-3 sentences max). Never use markdown asterisks or bullet points.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (content) {
          return content.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch {
      // Continue to next model or fallback
    }
  }

  return null;
}

// ─── Server Function: Generate Product Description ─────────────────────────────

export const generateProductDescription = createServerFn({ method: "POST" })
  .validator((data: GenerateProductDescriptionInput) => data)
  .handler(async ({ data }) => {
    const title = (data.title || "").trim();
    if (!title) {
      return { description: "", provider: "none" };
    }

    // 1. Try Hugging Face
    const hfPrompt = `Write a compelling 2-sentence luxury boutique description for "${title}" (Category: ${data.category || "Unisex Boutique"}, Department: ${data.department || "Unisex"}). Highlight the fabric feel, streetwear drape, and how to style it.`;
    const hfResult = await callHuggingFace(hfPrompt, 150);
    if (hfResult) {
      return { description: hfResult, provider: "huggingface" };
    }

    // 2. Intelligent Editorial Engine Fallback
    const fallback = generateCuratedDescription(data);
    return { description: fallback, provider: "editorial-engine" };
  });

// ─── Server Function: Generate Category Blurb ───────────────────────────────────

export const generateCategoryBlurb = createServerFn({ method: "POST" })
  .validator((data: GenerateCategoryBlurbInput) => data)
  .handler(async ({ data }) => {
    const name = (data.name || "").trim();
    if (!name) {
      return { blurb: "", provider: "none" };
    }

    const hfPrompt = `Write a concise 1-sentence editorial subtitle/blurb (10 to 18 words) for the fashion category "${name}" in a luxury streetwear boutique. Describe the garments and aesthetic.`;
    const hfResult = await callHuggingFace(hfPrompt, 60);
    if (hfResult) {
      return { blurb: hfResult, provider: "huggingface" };
    }

    const fallback = generateCuratedBlurb(data);
    return { blurb: fallback, provider: "editorial-engine" };
  });
