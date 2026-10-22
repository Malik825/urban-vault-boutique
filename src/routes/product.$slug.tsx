import { useState } from "react";
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
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
  CreditCard,
  Zap,
  CheckCircle2,
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
import { formatPrice, reviews, whatsappLink, createProductEnquiry, STORE } from "@/lib/store-data";
import { groupSpecs, type CatalogProduct } from "@/lib/catalog";
import { listPublishedProducts, recordProductView } from "@/lib/catalog.functions";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { optimizeImageUrl } from "@/lib/image";

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
        meta: [{ title: `Product unavailable — ${STORE.name}` }, { name: "robots", content: "noindex" }],
      };
    const p = loaderData.product;
    const productUrl = `${STORE.siteUrl}/product/${p.slug}`;
    const ogImage = p.images?.[0] ?? `${STORE.siteUrl}${STORE.logoUrl}`;
    return {
      meta: [
        { title: `${p.name} — ${formatPrice(p.price)} | ${STORE.name}` },
        {
          name: "description",
          content: `${p.name} (${p.condition}) — ${Object.values(p.specs).slice(0, 3).join(", ")}. In stock at ${STORE.name} with instant WhatsApp enquiry & Cash on Delivery.`,
        },
        { property: "og:title", content: `${p.name} | ${STORE.name}` },
        { property: "og:description", content: p.blurb },
        { property: "og:url", content: productUrl },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "product" },
        { name: "twitter:title", content: `${p.name} | ${STORE.name}` },
        { name: "twitter:description", content: p.blurb },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: productUrl }],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product, related, suggested, recent } = Route.useLoaderData();
  const navigate = useNavigate();
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
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowSticky(window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-muted max-h-[440px] sm:max-h-[480px] flex items-center justify-center">
              <img
                src={optimizeImageUrl(product.images[active], 800, 80)}
                alt={product.name}
                width={800}
                height={800}
                fetchPriority="high"
                decoding="sync"
                className="w-full h-full max-h-[440px] sm:max-h-[480px] object-cover object-center"
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
                  <img
                    src={optimizeImageUrl(im, 160, 75)}
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover"
                  />
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

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {product.stock > 0
                      ? `${product.stock} units available in stock`
                      : "Currently out of stock — join restock list"}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Condition: {product.condition}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    size="lg"
                    className="col-span-2 sm:flex-1 font-bold"
                    disabled={product.stock === 0}
                    onClick={() => {
                      if (!items.some((i) => i.product.id === product.id)) {
                        addItem(product);
                      }
                      navigate({ to: "/checkout" });
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="col-span-2 sm:flex-1 font-semibold border-primary/40 text-primary hover:bg-primary/10"
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

                  <Button asChild variant="whatsapp" size="lg" className="col-span-2 font-bold">
                    <a
                      href={whatsappLink(createProductEnquiry(product))}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Order / Enquire on WhatsApp
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="col-span-1"
                    onClick={() => {
                      toggleWishlist(product as CatalogProduct);
                      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                  >
                    <Heart className={`mr-1.5 h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
                    Wishlist
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
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
                    <Repeat2 className="mr-1.5 h-4 w-4" />
                    Compare
                  </Button>
                </div>

                <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-3">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> 100% Authentic Apparel
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 shrink-0 text-primary" /> Fast Assin Fosu dispatch
                  </p>
                  <p className="flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 shrink-0 text-primary" /> Hassle-free size exchange
                  </p>
                </div>

                {/* Ghana Delivery & Payment Information Preview */}
                <div className="mt-4 rounded-xl border border-border/70 bg-surface-muted/60 p-3.5 text-xs space-y-2.5">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Ghana Delivery Information
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      • Assin Fosu: Same-day delivery (GH₵ 20) &amp; Free Showroom Pickup<br/>
                      • Central (Cape Coast / Winneba): Same-day / 24 hrs (GH₵ 35)<br/>
                      • Ashanti, Greater Accra &amp; Nationwide: 24–48 hours tracked courier<br/>
                      • Store Pickup: Free collection at {STORE.pickupLocation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-amber-500" /> Payment Methods Supported
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Cash on Delivery (Assin Fosu), Paystack debit/credit cards, MTN MoMo, Telecel Cash, or direct WhatsApp ordering ({STORE.whatsapp}).
                    </p>
                  </div>
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
                    Delivery is same-day within Assin Fosu and Central Region for orders placed before 2pm, and 24–48 hours
                    nationwide to Kumasi, Accra, Takoradi, Tamale and other regional capitals with tracked couriers.
                    Pickup from our {STORE.pickupLocation} is always free.
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

      {/* Sticky Bottom CTA Bar (Appears when scrolling down) */}
      <div
        className={`fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-2.5 sm:py-3 shadow-2xl transition-all duration-300 ${
          showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        } bottom-16 sm:bottom-0`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
              <img
                src={optimizeImageUrl(product.images[0], 96, 75)}
                alt={product.name}
                width={48}
                height={48}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold truncate text-foreground">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm sm:text-base font-extrabold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compareAt && (
                  <span className="text-[11px] text-muted-foreground line-through hidden sm:inline">
                    {formatPrice(product.compareAt)}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground hidden sm:inline">· {product.condition}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 font-semibold h-9 px-3 text-xs"
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
              <ShoppingCart className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Add to Cart</span>
            </Button>

            <Button
              size="sm"
              disabled={product.stock === 0}
              onClick={() => {
                if (!items.some((i) => i.product.id === product.id)) {
                  addItem(product);
                }
                navigate({ to: "/checkout" });
              }}
              className="h-9 px-4 font-bold text-xs"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              Buy Now
            </Button>

            <Button
              size="sm"
              variant="whatsapp"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold hidden md:inline-flex"
              asChild
            >
              <a href={whatsappLink(createProductEnquiry(product))} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-1.5" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
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
