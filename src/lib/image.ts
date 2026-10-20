/**
 * Universal Image Optimization Helper
 * Ensures modern formats (WebP/AVIF), responsive dimensions, and proper compression.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  width = 500,
  quality = 75
): string {
  if (!url) return "/placeholder.jpg";

  // 1. Optimize Unsplash hosted assets
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    } catch {
      return url
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`);
    }
  }

  // 2. Map local boutique images to ultra-light modern WebP equivalents
  if (url.startsWith("/boutique/") && url.endsWith(".jpg")) {
    return url.replace(/\.jpg$/, ".webp");
  }

  // 3. Root logos
  if (url === "/logo.jpg" || url === "/urban-vault-logo.jpg") {
    return url.replace(/\.jpg$/, ".webp");
  }

  return url;
}
