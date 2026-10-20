import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Reveal } from "@/components/reveal";
import TextAnimation from "@/components/ui/scroll-text";
import { STORE, whatsappLink } from "@/lib/store-data";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: `FAQs — ${STORE.name}` },
      {
        name: "description",
        content: `Frequently asked questions about ${STORE.name} — shipping, returns, device conditions, payments and more.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/faqs` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/faqs` }],
  }),
  component: FaqsPage,
});

const categories = [
  "All",
  "Orders & Shipping",
  "Sizing & Quality",
  "Payments",
  "Exchanges & Returns",
];

const faqs = [
  {
    category: "Orders & Shipping",
    question: "How long does delivery take?",
    answer:
      "Orders within Accra are delivered same-day (within 2 to 6 hours) via our fast dispatch riders. For deliveries to Kumasi, Takoradi, and other regions across Ghana, parcels take 24–48 hours via trusted couriers.",
  },
  {
    category: "Orders & Shipping",
    question: "Do you deliver outside Accra?",
    answer:
      "Yes! We deliver nationwide across all regions in Ghana. Regional orders are dispatched daily and arrive within 1–2 business days. Delivery fees are calculated transparently at checkout.",
  },
  {
    category: "Orders & Shipping",
    question: "Can I pick up my order in person?",
    answer:
      `Yes. You can select 'Store Pickup' at checkout to pick up your order directly from our showroom in Accra (${STORE.pickupLocation}).`,
  },
  {
    category: "Orders & Shipping",
    question: "How do I track my order?",
    answer:
      `Once your order is confirmed and dispatched, you will receive real-time dispatch updates directly on WhatsApp (${STORE.whatsapp}) with your rider/courier details.`,
  },
  {
    category: "Sizing & Quality",
    question: "How do I know what size to choose?",
    answer:
      `Most of our streetwear tees and hoodies feature a relaxed, modern boxy silhouette. You can check the sizing chart on the product page or message our stylists on WhatsApp (${STORE.whatsapp}) for personalized fit advice before ordering.`,
  },
  {
    category: "Sizing & Quality",
    question: "Are your boutique items authentic?",
    answer:
      "100% authentic. All clothing, sneakers, and accessories in Urban Vault Unisex Boutique are inspected for premium fabrics, heavyweight GSM cotton, clean stitching, and authentic designer details.",
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept: 1) Cash on Delivery upon physical arrival in Accra, 2) Paystack online payment with debit/credit cards (Visa, Mastercard), 3) Mobile Money (MTN MoMo, Telecel Cash), and 4) Direct WhatsApp order confirmation.",
  },
  {
    category: "Payments",
    question: "How does Cash on Delivery (COD) work?",
    answer:
      "Select 'Cash on Delivery' at checkout. When our rider delivers your package to your doorstep in Accra, you inspect the package and pay cash or MoMo directly to the courier.",
  },
  {
    category: "Payments",
    question: "Is it safe to pay online via Paystack?",
    answer:
      "Yes. Online payments are secured by Paystack with 256-bit bank-level encryption. Your card or MoMo details are processed through official banking channels.",
  },
  {
    category: "Exchanges & Returns",
    question: "Can I exchange for a different size if it doesn't fit?",
    answer:
      `Absolutely. If the fit isn't right, notify us on WhatsApp (${STORE.whatsapp}) within 48 hours of delivery. As long as tags remain attached and the item is unworn, we will exchange your size.`,
  },
  {
    category: "Business",
    question: "Do you offer bulk or corporate pricing?",
    answer:
      "Yes. We have dedicated pricing for bulk orders of 5+ items and corporate uniforms/merchandise. Please contact our team via WhatsApp or email and include your product requirements and quantity.",
  },
  {
    category: "Business",
    question: "Can I stock my brand with Urban Vault?",
    answer:
      "We work with selected designers and independent brands. If you'd like to stock your pieces with us, reach out via WhatsApp or email with your lookbook. All partner brands must align with our quality and style standards.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="group"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-md"
      >
        <span className="font-semibold text-foreground leading-snug">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FaqsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = faqs.filter((f) => {
    const matchesCat = activeCategory === "All" || f.category === activeCategory;
    const matchesQuery =
      !query ||
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <Badge variant="outline" className="mb-6 rounded-full border px-4 py-1.5 text-xs font-semibold">
            Support centre
          </Badge>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            Frequently Asked <span className="text-gradient-brand">Questions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about shopping at Urban Vault. Can't find an answer?{" "}
            <a
              href={whatsappLink("Hi Urban Vault, I have a question about your boutique items.")}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Chat with us.
            </a>
          </p>
          {/* Search */}
          <div className="relative mt-8 mx-auto max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="h-12 rounded-full pl-10 pr-4 border-border shadow-sm"
            />
          </div>
        </motion.div>
      </section>

      {/* Category pills */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md py-3">
        <div className="mx-auto max-w-4xl container-x">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <section className="section-pad">
        <div className="mx-auto max-w-4xl container-x">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-lg font-medium">No results for "{query}"</p>
              <p className="mt-2 text-sm">Try a different keyword or browse all categories.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <FaqItem
                  key={`${faq.category}-${i}`}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions CTA */}
      <Reveal>
        <section className="section-pad bg-surface-muted">
          <div className="mx-auto max-w-2xl container-x text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            <TextAnimation
              as="h2"
              text="Still have questions?"
              classname="text-2xl font-extrabold sm:text-3xl"
              variants={{
                hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5 } },
              }}
            />
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Our team is online every day from 8am to 8pm. Reach us on WhatsApp for the fastest response.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 shadow-md">
                <a href={whatsappLink("Hi Urban Vault, I have a question about your products.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/about">About us</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <SiteFooter />
    </div>
  );
}
