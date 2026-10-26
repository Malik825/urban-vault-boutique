import { createServerFn } from "@tanstack/react-start";
import { getAdminClient } from "@/lib/admin.functions";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/lib/hero";

const HERO_STORAGE_PATH = "settings/hero_slides.json";
const BUCKET_NAME = "product-images";

/** In-memory cache for public hero slides (30s TTL) */
let cachedHeroSlides: HeroSlide[] | null = null;
let heroCacheTimestamp = 0;
const HERO_CACHE_TTL_MS = 30 * 1000;

export const getPublicHeroSlides = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroSlide[]> => {
    if (cachedHeroSlides && Date.now() - heroCacheTimestamp < HERO_CACHE_TTL_MS) {
      return cachedHeroSlides;
    }

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(HERO_STORAGE_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedHeroSlides = parsed;
          heroCacheTimestamp = Date.now();
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn("[getPublicHeroSlides] Falling back to default slides:", err?.message || err);
    }

    return DEFAULT_HERO_SLIDES;
  },
);

export const adminGetHeroSlides = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroSlide[]> => {
    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(HERO_STORAGE_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn("[adminGetHeroSlides] Error reading hero slides:", err?.message || err);
    }

    return DEFAULT_HERO_SLIDES;
  },
);

export const adminSaveHeroSlides = createServerFn({ method: "POST" })
  .validator((data: { slides: HeroSlide[] }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const payload = Buffer.from(JSON.stringify(data.slides, null, 2));

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(HERO_STORAGE_PATH, payload, {
          contentType: "application/json",
          upsert: true,
        });

      if (error) {
        throw new Error(error.message || "Failed to save hero slides");
      }

      // Invalidate memory cache so changes reflect immediately
      cachedHeroSlides = data.slides;
      heroCacheTimestamp = Date.now();

      return { ok: true, count: data.slides.length };
    } catch (err: any) {
      console.error("[adminSaveHeroSlides] Error:", err);
      throw new Error(err.message || "Failed to save hero slides");
    }
  });

export const adminUploadHeroImage = createServerFn({ method: "POST" })
  .validator(
    (data: { base64: string; fileName: string; contentType: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const buffer = Buffer.from(data.base64, "base64");
      const ext = data.fileName.split(".").pop() || "webp";
      const cleanName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const path = `hero/${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, { contentType: data.contentType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      return { publicUrl: urlData.publicUrl };
    } catch (err: any) {
      console.error("[adminUploadHeroImage] Error:", err);
      throw new Error(err.message || "Failed to upload hero image");
    }
  });
