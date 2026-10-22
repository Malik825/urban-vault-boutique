import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink, createProductEnquiry, type Product } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/user-store";
import type { CatalogProduct } from "@/lib/catalog";
import { optimizeImageUrl } from "@/lib/image";

export function ProductCard({
  product,
  view = "grid",
  variant = "standard",
}: {
  product: Product | CatalogProduct;
  view?: "grid" | "list";
  variant?: "standard" | "featured" | "wide";
}) {
  const { items, addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const saved = isWishlisted(product.id);

  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const hasSecondImage = Boolean(product.images[1]);

  const media = (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className={`relative block overflow-hidden bg-slate-100 dark:bg-muted/30 ${
        variant === "wide"
          ? "w-full sm:w-5/12 aspect-[16/10] sm:aspect-auto sm:min-h-full shrink-0"
          : view === "list"
          ? "aspect-square w-28 sm:w-44 shrink-0 rounded-xl"
          : "aspect-[4/5] w-full"
      }`}
      aria-label={`View ${product.name}`}
    >
      {/* Primary image */}
      <motion.img
        src={optimizeImageUrl(product.images[0], 500, 75)}
        alt={product.name}
        loading="lazy"
        width={500}
        height={625}
        className="absolute inset-0 h-full w-full object-cover object-top"
        variants={{
          rest: { scale: 1, opacity: 1 },
          hover: hasSecondImage ? { scale: 1.05, opacity: 0 } : { scale: 1.05, opacity: 1 },
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Secondary image */}
      {hasSecondImage && (
        <motion.img
          src={optimizeImageUrl(product.images[1], 500, 75)}
          alt=""
          aria-hidden
          loading="lazy"
          width={500}
          height={625}
          variants={{
            rest: { opacity: 0, scale: 1.1 },
            hover: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      )}

      {/* Badges (New, -15%, Trending, Best seller) */}
      <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
        {discount > 0 && (
          <span className="rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
            −{discount}%
          </span>
        )}
        {product.badge && product.badge !== "None" && (
          <span
            className={`rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-bold shadow-xs inline-flex items-center gap-1 uppercase tracking-wider ${
              product.badge.toLowerCase().includes("trend")
                ? "bg-amber-500 text-slate-950 font-black"
                : product.badge.toLowerCase().includes("best")
                ? "bg-foreground text-background font-black"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.badge.toLowerCase().includes("trend") && "🔥 "}
            {product.badge.toLowerCase().includes("best") && "★ "}
            {product.badge}
          </span>
        )}
      </div>

      {/* Wishlist circular button on top right */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product as CatalogProduct);
          toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label="Toggle wishlist"
        className="absolute right-2.5 top-2.5 z-10 grid h-8.5 w-8.5 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/95 dark:bg-card/90 shadow-xs border border-slate-200/60 dark:border-border/60 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:scale-105 transition-all"
      >
        <Heart
          className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-300"}`}
        />
      </button>
    </Link>
  );

  const body = (
    <div
      className={`flex flex-1 flex-col justify-between ${
        variant === "wide" ? "p-4 sm:p-5" : view === "list" ? "p-3 sm:p-5" : "p-3 sm:p-4"
      }`}
    >
      <div>
        {/* Row 1: Brand & Rating */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {product.brand}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal text-[11px]">({product.reviews})</span>
          </span>
        </div>

        {/* Row 2: Product Name */}
        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 mt-1 tracking-tight">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {view === "list" && (
          <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">{product.blurb}</p>
        )}

        {/* Row 3: Price in Active Theme Primary + Compare At */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-extrabold text-base sm:text-lg text-primary tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through font-normal">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>

        {/* Row 4: Stock Status (Theme primary dot + In stock) */}
        <div className="mt-1 mb-2.5 flex items-center gap-1.5 text-xs font-medium text-primary">
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              product.stock === 0
                ? "bg-muted-foreground"
                : product.stock <= 4
                ? "bg-amber-500"
                : "bg-primary"
            }`}
          />
          <span>
            {product.stock === 0
              ? "Out of stock"
              : product.stock <= 4
              ? `Only ${product.stock} left`
              : "In stock"}
          </span>
        </div>
      </div>

      {/* Row 5: Action Buttons (WhatsApp + Add to cart) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Enquire on WhatsApp"
          title="Enquire on WhatsApp"
          className="h-9 w-9 rounded-xl border border-primary/35 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary shrink-0"
          asChild
        >
          <a
            href={whatsappLink(createProductEnquiry(product))}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </Button>

        <Button
          size="sm"
          disabled={product.stock === 0}
          onClick={(e) => {
            e.preventDefault();
            if (items.some((i) => i.product.id === product.id)) {
              toast.error("Item is already in your cart");
            } else {
              addItem(product);
              toast.success(`${product.name} added to cart`);
            }
          }}
          className="h-9 flex-1 min-w-0 px-2.5 sm:px-3 bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap"
        >
          <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{product.stock === 0 ? "Out of stock" : "Add to cart"}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={`group hover-lift flex overflow-hidden rounded-2xl border border-slate-200/80 dark:border-border/70 bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-border ${
        variant === "wide"
          ? "flex-col sm:flex-row items-stretch h-full"
          : view === "list"
          ? "flex-row items-stretch gap-2 p-2.5 sm:p-3"
          : "flex-col h-full"
      }`}
    >
      {media}
      {body}
    </motion.article>
  );
}
