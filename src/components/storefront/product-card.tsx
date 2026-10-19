import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, ShoppingCart, Star, Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink, createProductEnquiry, type Product } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { useWishlist, useCompare } from "@/lib/user-store";
import type { CatalogProduct } from "@/lib/catalog";

function StockPill({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Out of stock
      </span>
    );
  if (stock <= 4)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> In stock · {stock}
    </span>
  );
}

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
  const { isComparing, addToCompare, removeFromCompare } = useCompare();

  const saved = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const hasSecondImage = Boolean(product.images[1]);

  const media = (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className={`relative block overflow-hidden bg-surface-muted ${
        variant === "wide"
          ? "w-full sm:w-5/12 aspect-[16/10] sm:aspect-auto sm:min-h-full shrink-0"
          : variant === "featured"
          ? "aspect-square sm:aspect-[4/5] w-full"
          : view === "list"
          ? "aspect-square w-28 sm:w-44 shrink-0 rounded-xl"
          : "aspect-square sm:aspect-[4/5] w-full"
      }`}
      aria-label={`View ${product.name}`}
    >
      {/* Primary image */}
      <motion.img
        src={product.images[0]}
        alt={product.name}
        loading="lazy"
        width={1024}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover"
        variants={{
          rest: { scale: 1, opacity: 1 },
          hover: hasSecondImage ? { scale: 1.05, opacity: 0 } : { scale: 1.05, opacity: 1 },
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Secondary image */}
      {hasSecondImage && (
        <motion.img
          src={product.images[1]}
          alt=""
          aria-hidden
          loading="lazy"
          width={1024}
          height={1024}
          variants={{
            rest: { opacity: 0, scale: 1.1 },
            hover: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Badges */}
      <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-10 flex flex-col items-start gap-1">
        {product.badge && (
          <Badge className="border-0 bg-primary text-primary-foreground font-semibold text-[10px] sm:text-xs rounded-md px-2 py-0.5 shadow-xs">
            {product.badge}
          </Badge>
        )}
        {discount > 0 && !product.badge && (
          <Badge variant="secondary" className="glass border font-bold text-[10px] sm:text-xs px-1.5 py-0.5">
            −{discount}%
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product as CatalogProduct);
          toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label="Toggle wishlist"
        className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 z-10 grid h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 place-items-center rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground shadow-xs transition-transform hover:scale-110 hover:text-rose-500"
      >
        <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
      </button>
    </Link>
  );

  const body = (
    <div
      className={`flex flex-1 flex-col justify-between gap-2.5 sm:gap-3 ${
        variant === "wide" ? "p-3.5 sm:p-5" : variant === "featured" ? "p-3.5 sm:p-5" : view === "list" ? "p-3.5 sm:p-5" : "p-3 sm:p-4"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground truncate">
            {product.brand}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-foreground shrink-0">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal text-[10px]">({product.reviews})</span>
          </span>
        </div>

        <h3
          className={`font-display font-bold leading-tight sm:leading-snug tracking-tight mt-1 sm:mt-1.5 ${
            variant === "featured" ? "text-sm sm:text-lg" : "text-xs sm:text-[0.925rem]"
          }`}
        >
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </Link>
        </h3>

        {view === "list" && (
          <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">{product.blurb}</p>
        )}

        <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center gap-1.5">
          <StockPill stock={product.stock} />
          <Badge variant="outline" className="border-border/80 bg-muted/20 text-muted-foreground rounded-md text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5">
            {product.condition}
          </Badge>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 flex flex-col gap-2 sm:gap-2.5 pt-1 border-t border-border/40">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className={`font-display font-extrabold tracking-tight text-foreground ${
            variant === "featured" ? "text-base sm:text-xl" : "text-sm sm:text-lg"
          }`}>
            {formatPrice(product.price)}
          </p>
          {product.compareAt && (
            <p className="text-[11px] sm:text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Enquire on WhatsApp"
            title="Enquire on WhatsApp"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border-border text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10 shrink-0"
            asChild
          >
            <a
              href={whatsappLink(createProductEnquiry(product))}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          </Button>

          {/* Hide compare on compact mobile view so Add to cart has plenty of room */}
          <Button
            variant="outline"
            size="icon"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            title="Compare"
            onClick={() => {
              if (comparing) {
                removeFromCompare(product.id);
                toast.info("Removed from compare");
              } else {
                addToCompare(product as CatalogProduct);
                toast.success("Added to compare");
              }
            }}
            className={`hidden sm:inline-flex h-9 w-9 rounded-xl border-border shrink-0 ${comparing ? "border-primary text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Repeat2 className="h-4 w-4" />
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
            className="h-8 sm:h-9 flex-1 min-w-0 px-2 sm:px-3 bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.stock === 0 ? "Out of stock" : "Add to cart"}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={`group hover-lift flex overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:border-border ${
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
