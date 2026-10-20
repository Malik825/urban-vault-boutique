import { createFileRoute, Link } from "@tanstack/react-router";
import { Repeat2, X, CheckCircle2, MinusCircle } from "lucide-react";

import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, STORE } from "@/lib/store-data";
import { useCompare } from "@/lib/user-store";
import { useCart } from "@/lib/cart";
import { SPEC_GROUPS } from "@/lib/catalog";
import { toast } from "sonner";
import { optimizeImageUrl } from "@/lib/image";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: `Compare Products — ${STORE.name}` },
      { name: "description", content: `Compare items and details side by side on ${STORE.name}.` },
      { property: "og:url", content: `${STORE.siteUrl}/compare` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/compare` }],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  // Collect all spec keys across compared products
  const allSpecKeys = SPEC_GROUPS.flatMap((g) => g.keys).filter((key) =>
    compareList.some((p) => p.specs[key]),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl container-x pb-20 pt-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Side by side
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              Compare Products
            </h1>
          </div>
          {compareList.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompare}>
              <X className="mr-2 h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {compareList.length === 0 ? (
          /* Empty state */
          <div className="mt-20 flex flex-col items-center gap-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-muted">
              <Repeat2 className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">Nothing to compare yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Click the compare icon on any product card to add it here.
              </p>
            </div>
            <Button asChild>
              <Link to="/products" search={{}}>
                Browse products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              {/* Product headers */}
              <thead>
                <tr>
                  <th className="w-40 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground" />
                  {compareList.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-left">
                      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-card">
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          aria-label={`Remove ${p.name} from compare`}
                          className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <img
                          src={optimizeImageUrl(p.images[0], 300, 75)}
                          alt={p.name}
                          width={150}
                          height={112}
                          loading="lazy"
                          className="mx-auto mb-3 h-28 w-full rounded-xl object-cover"
                        />
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          className="block font-display text-sm font-bold leading-snug hover:text-primary"
                        >
                          {p.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">{p.brand}</p>
                        <p className="mt-2 font-display text-lg font-extrabold text-foreground">
                          {formatPrice(p.price)}
                        </p>
                        {p.badge && (
                          <Badge className="mt-2 border-transparent bg-brand-gradient text-primary-foreground">
                            {p.badge}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          disabled={p.stock === 0}
                          onClick={() => {
                            addItem(p);
                            toast.success(`${p.name} added to cart`);
                          }}
                        >
                          {p.stock === 0 ? "Out of stock" : "Add to cart"}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Overview rows */}
                {[
                  { label: "Condition", key: "condition" as const },
                  { label: "In stock", key: "stock" as const },
                  { label: "Rating", key: "rating" as const },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {row.label}
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-sm">
                        {row.key === "stock" ? (
                          p.stock > 0 ? (
                            <span className="flex items-center gap-1.5 text-accent-foreground">
                              <CheckCircle2 className="h-4 w-4" /> {p.stock} units
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <MinusCircle className="h-4 w-4" /> Out of stock
                            </span>
                          )
                        ) : (
                          <span className="font-medium">{String(p[row.key])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Spec rows */}
                {allSpecKeys.map((key) => {
                  const values = compareList.map((p) => p.specs[key] ?? "—");
                  const allSame = values.every((v) => v === values[0]);
                  return (
                    <tr key={key} className="border-t border-border">
                      <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {key}
                      </td>
                      {compareList.map((p, i) => (
                        <td
                          key={p.id}
                          className={`px-4 py-3 text-sm font-medium ${
                            !allSame && compareList.length > 1
                              ? values[i] === Math.max(...values.map((v) => parseFloat(v) || 0)).toString()
                                ? "text-accent-foreground"
                                : ""
                              : ""
                          }`}
                        >
                          {p.specs[key] ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
