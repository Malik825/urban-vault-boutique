import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ChevronRight,
  Heart,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Reveal } from "@/components/reveal";
import { useCart } from "@/lib/cart";
import { useWishlist, useCompare } from "@/lib/user-store";
import { formatPrice, reviews, whatsappLink } from "@/lib/store-data";
import { groupSpecs, type CatalogProduct } from "@/lib/catalog";
import { listPublishedProducts, recordProductView } from "@/lib/catalog.functions";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const catalog = await listPublishedProducts();
    const product = catalog.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return {
      product,
      related: catalog.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 4),
      suggested: catalog
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 4),
      recent: catalog.filter((p) => p.id !== product.id).slice(6, 10),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Product unavailable — Voltix" }, { name: "robots", content: "noindex" }],
      };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — ${formatPrice(p.price)} | Voltix` },
        {
          name: "description",
          content: `${p.name} (${p.condition}) — ${Object.values(p.specs).slice(0, 3).join(", ")}. Verified stock with instant WhatsApp enquiry.`,
        },
        { property: "og:title", content: `${p.name} | Voltix` },
        { property: "og:description", content: p.blurb },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product, related, suggested, recent } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const { items, addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, addToCompare, removeFromCompare } = useCompare();

  const saved = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  const [activeTab, setActiveTab] = useState("description");
  const tabsContentRef = useRef<HTMLDivElement>(null);

  // Reviews state
  const [reviewList, setReviewList] = useState(reviews);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRole, setNewReviewRole] = useState("");
  const [newReviewText, setNewReviewText] = useState("");

  useEffect(() => {
    if (product?.slug) {
      recordProductView({ data: { slug: product.slug } }).catch(() => {});
    }
  }, [product?.slug]);

  useEffect(() => {
    if (tabsContentRef.current) {
      // Animate active tab content when it switches
      const activeEl = tabsContentRef.current.querySelector('[data-state="active"]');
      if (activeEl) {
        gsap.fromTo(
          activeEl,
          { opacity: 0, y: 15, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out", overwrite: "auto" }
        );
      }
    }
  }, [activeTab]);


  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;
  const specGroups = groupSpecs(product.specs);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl container-x pb-16 pt-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/products" search={{ category: product.category }} className="hover:text-foreground">
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* Gallery */}
          <div className="animate-fade-in">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-muted">
              <img
                src={product.images[active]}
                alt={product.name}
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-3">
              {product.images.map((im: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`overflow-hidden rounded-xl border-2 transition-colors ${
                    active === i ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={im} alt="" loading="lazy" className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Purchase panel */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md">
                  {product.brand}
                </Badge>
                {product.badge && (
                  <Badge className="border-transparent bg-brand-gradient text-primary-foreground">
                    {product.badge}
                  </Badge>
                )}
                <Badge variant="secondary" className="rounded-md">
                  {product.condition}
                </Badge>
              </div>

              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-warning text-warning" : "text-border"}`}
                    />
                  ))}
                </span>
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">· {product.reviews} reviews</span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <p className="font-display text-2xl font-extrabold sm:text-3xl">
                  {formatPrice(product.price)}
                </p>
                {product.compareAt && (
                  <>
                    <p className="text-base text-muted-foreground line-through">
                      {formatPrice(product.compareAt)}
                    </p>
                    <Badge className="border-transparent bg-primary-soft text-accent-foreground">
                      Save {discount}%
                    </Badge>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.blurb}</p>

              <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm font-semibold">
                  {product.stock > 0
                    ? `${product.stock} units available · ships today`
                    : "Currently out of stock — join the restock list"}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    size="lg"
                    className="col-span-2 sm:flex-1"
                    disabled={product.stock === 0}
                    onClick={() => {
                      if (items.some((i) => i.product.id === product.id)) {
                        toast.error("Item is already in your cart");
                      } else {
                        addItem(product);
                        toast.success(`${product.name} added to cart`);
                      }
                    }}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button asChild variant="whatsapp" size="lg" className="col-span-2 sm:flex-1">
                    <a
                      href={whatsappLink(
                        `Hi Voltix, I want to buy the ${product.name} (${formatPrice(product.price)}). Is it available?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Enquire on WhatsApp
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="col-span-1"
                    onClick={() => {
                      toggleWishlist(product as CatalogProduct);
                      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${saved ? "fill-primary text-primary" : ""}`} />
                    <span className="sm:hidden lg:inline">Wishlist</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`col-span-1 ${comparing ? "border-primary text-primary" : ""}`}
                    onClick={() => {
                      if (comparing) {
                        removeFromCompare(product.id);
                        toast.info("Removed from compare");
                      } else {
                        addToCompare(product as CatalogProduct);
                        toast.success("Added to compare");
                      }
                    }}
                  >
                    <Repeat2 className="mr-2 h-5 w-5" />
                    <span className="sm:hidden lg:inline">Compare</span>
                  </Button>
                </div>
                <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-3">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Verified unit
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 shrink-0 text-primary" /> Same-day Lagos
                  </p>
                  <p className="flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 shrink-0 text-primary" /> 7-day returns
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                {(Object.entries(product.specs) as [string, string][])
                  .slice(0, 4)
                  .map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border bg-surface-muted p-3">
                      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="mt-1 truncate text-sm font-semibold">{v}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </Reveal>
        </div>

        {/* Tabs */}
        <section className="mt-16">
          <Tabs defaultValue="description" onValueChange={setActiveTab}>
            <TabsList className="h-auto flex-wrap rounded-xl bg-surface-muted p-1">
              <TabsTrigger value="description" className="rounded-lg px-4 py-2">
                Description
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-lg px-4 py-2">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg px-4 py-2">
                Reviews ({product.reviews})
              </TabsTrigger>
            </TabsList>

            <div ref={tabsContentRef}>
              <TabsContent value="description" className="mt-6">
                <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    The {product.name} is one of our most requested {product.category.toLowerCase()}.
                    Every unit passes a 22-point inspection covering battery health, port function,
                    display uniformity and thermal behaviour before it is listed.
                  </p>
                  <p>
                    Condition is graded as <strong className="text-foreground">{product.condition}</strong>,
                    and the listing photos are of the exact unit in stock. Bulk pricing is available for
                    orders of five units or more — message us on WhatsApp with your quantity and we&apos;ll
                    send a quote the same day.
                  </p>
                  <p>
                    Delivery is same-day within Lagos for orders placed before 2pm, and 24–48 hours
                    nationwide with tracked couriers. Pickup from our Ikeja counter is always free.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
                  {specGroups.map((g) => (
                    <div
                      key={g.label}
                      className="overflow-hidden rounded-lg border border-border/70 bg-card transition-shadow duration-300 hover:shadow-card"
                    >
                      <p className="border-b border-border/70 bg-surface-muted px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {g.label}
                      </p>
                      <table className="w-full text-sm">
                        <tbody>
                          {g.rows.map((row) => (
                            <tr key={row.key} className="border-b border-border/50 last:border-0">
                              <th className="w-1/2 px-4 py-2.5 text-left font-medium text-muted-foreground">
                                {row.key}
                              </th>
                              <td className="px-4 py-2.5 font-semibold">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
                    <p className="border-b border-border/70 bg-surface-muted px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Listing
                    </p>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <th className="w-1/2 px-4 py-2.5 text-left font-medium text-muted-foreground">
                            Condition
                          </th>
                          <td className="px-4 py-2.5 font-semibold">{product.condition}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                            Brand
                          </th>
                          <td className="px-4 py-2.5 font-semibold">{product.brand}</td>
                        </tr>
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                            Availability
                          </th>
                          <td className="px-4 py-2.5 font-semibold">
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold">Customer Feedback</h3>
                    <p className="text-xs text-muted-foreground">Real reviews from verified gadget buyers across Africa.</p>
                  </div>

                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 rounded-full font-semibold">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" /> Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience with the {product.name}.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newReviewName.trim() || !newReviewText.trim()) {
                            toast.error("Please fill in your name and review.");
                            return;
                          }
                          setReviewList([
                            {
                              name: newReviewName.trim(),
                              role: newReviewRole.trim() || "Verified Buyer",
                              rating: newReviewRating,
                              text: newReviewText.trim(),
                            },
                            ...reviewList,
                          ]);
                          setNewReviewName("");
                          setNewReviewRole("");
                          setNewReviewText("");
                          setNewReviewRating(5);
                          setReviewDialogOpen(false);
                          toast.success("Thank you! Your review has been published.");
                        }}
                        className="space-y-4 pt-2"
                      >
                        <div className="space-y-1.5">
                          <Label>Rating</Label>
                          <div className="flex items-center gap-1.5 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="p-1 transition-transform hover:scale-125 focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= newReviewRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30 hover:text-amber-300"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-xs font-bold text-muted-foreground">
                              {newReviewRating} out of 5 stars
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="review-name">Your Name</Label>
                            <Input
                              id="review-name"
                              required
                              placeholder="e.g. Kwame A."
                              value={newReviewName}
                              onChange={(e) => setNewReviewName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="review-role">Location / Role</Label>
                            <Input
                              id="review-role"
                              placeholder="e.g. Accra, Ghana"
                              value={newReviewRole}
                              onChange={(e) => setNewReviewRole(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="review-text">Review</Label>
                          <Textarea
                            id="review-text"
                            required
                            rows={3}
                            placeholder="How is the build quality, battery life, performance?"
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                          />
                        </div>

                        <DialogFooter className="pt-2">
                          <Button type="button" variant="ghost" onClick={() => setReviewDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Submit Review</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                  {reviewList.map((r, idx) => (
                    <figure key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < Math.round(r.rating) ? "fill-warning text-warning" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        “{r.text}”
                      </blockquote>
                      <figcaption className="mt-4 text-xs font-semibold">
                        {r.name} <span className="font-normal text-muted-foreground">· {r.role}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <Rail title="You may also like" items={suggested} />
        <Rail title={`More from ${product.brand}`} items={related} />
        <Rail title="Recently viewed" items={recent} />
      </div>

      <SiteFooter />
    </div>
  );
}

function Rail({ title, items }: { title: string; items: CatalogProduct[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
        <Separator className="hidden flex-1 sm:block" />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
