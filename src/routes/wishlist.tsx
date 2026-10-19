import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/user-store";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: `My Wishlist — ${STORE.name}` },
      { name: "description", content: `Your saved items on ${STORE.name}.` },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl container-x pb-20 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Saved items
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              My Wishlist{" "}
              {wishlist.length > 0 && (
                <span className="text-muted-foreground">({wishlist.length})</span>
              )}
            </h1>
          </div>
          {wishlist.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/products" search={{}}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse more
              </Link>
            </Button>
          )}
        </div>

        {wishlist.length === 0 ? (
          /* Empty state */
          <div className="mt-20 flex flex-col items-center gap-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-muted">
              <Heart className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">No saved items yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap the heart icon on any product to save it here.
              </p>
            </div>
            <Button asChild>
              <Link to="/products" search={{}}>
                Browse products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <button
                    onClick={() => {
                      toggleWishlist(product);
                      toast.success("Removed from wishlist");
                    }}
                    aria-label="Remove from wishlist"
                    className="absolute -right-2 -top-2 z-20 grid h-7 w-7 place-items-center rounded-full border border-border bg-card shadow-card transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
