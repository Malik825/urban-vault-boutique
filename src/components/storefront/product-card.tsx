import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, ShoppingCart, Star, Repeat2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink, type Product } from "@/lib/store-data";
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
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> In stock · {stock}
    </span>
  );
}

export function ProductCard({
  product,
  view = "grid",
}: {
  product: Product | CatalogProduct;
  view?: "grid" | "list";
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
        view === "list" ? "aspect-square w-32 shrink-0 rounded-xl sm:w-44" : "aspect-[4/3] w-full"
      }`}
      aria-label={`View ${product.name}`}
    >
      {/* Primary image */}
      <img
        src={product.images[0]}
        alt={product.name}
        loading="lazy"
        width={1024}
        height={1024}
        className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.06] ${
          hasSecondImage ? "group-hover:opacity-0" : ""
        }`}
      />

      {/* Secondary image */}
      {hasSecondImage && (
        <img
          src={product.images[1]}
          alt=""
          aria-hidden
          loading="lazy"
          width={1024}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
        />
      )}

      {/* Badges */}
      <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
        {product.badge && (
          <Badge className="border-transparent bg-brand-gradient text-primary-foreground shadow-xs">
            {product.badge}
          </Badge>
        )}
        {discount > 0 && (
          <Badge variant="secondary" className="glass border font-semibold">
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
        className="glass absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border transition-transform hover:scale-105"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
      </button>
    </Link>
  );

  const body = (
    <div className={`flex flex-1 flex-col gap-3 ${view === "list" ? "p-4 sm:p-5" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {product.brand}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {product.rating.toFixed(1)}
          <span className="text-muted-foreground">({product.reviews})</span>
        </span>
      </div>

      <h3 className="font-display text-[0.925rem] font-semibold leading-snug tracking-tight">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary-deep">
          {product.name}
        </Link>
      </h3>

      {view === "list" && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.blurb}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StockPill stock={product.stock} />
        <Badge variant="outline" className="rounded-md text-[11px] font-medium">
          {product.condition}
        </Badge>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2">
          <p className="font-display text-base font-bold tracking-tight">
            {formatPrice(product.price)}
          </p>
          {product.compareAt && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Enquire on WhatsApp"
            asChild
          >
            <a
              href={whatsappLink(`Hi Voltix, I'm interested in the ${product.name} — is it available?`)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            onClick={() => {
              if (comparing) {
                removeFromCompare(product.id);
                toast.info("Removed from compare");
              } else {
                addToCompare(product as CatalogProduct);
                toast.success("Added to compare");
              }
            }}
            className={comparing ? "border-primary text-primary" : ""}
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
            className="gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock === 0 ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <article
      className={`group hover-lift flex overflow-hidden rounded-2xl border border-border bg-card shadow-card ${
        view === "list" ? "flex-row items-stretch gap-2 p-3" : "flex-col"
      }`}
    >
      {media}
      {body}
    </article>
  );
}
