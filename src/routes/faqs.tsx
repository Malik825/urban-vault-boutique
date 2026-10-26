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
  "Accra Pickup & Local",
  "Nationwide Delivery",
  "Payments & MoMo",
  "Sizing & Quality",
  "Exchanges & Returns",
];

const faqs = [
  {
    category: "Accra Pickup & Local",
    question: "Where is the Urban Vault flagship store located?",
    answer:
      `Our Accra flagship store is located in Greater Accra Region, Ghana (${STORE.pickupLocation}). You can visit us in person to try on apparel, browse new drops, or pick up online orders.`,
  },
  {
    category: "Accra Pickup & Local",
    question: "Can I pick up my online order in person for free?",
    answer:
      `Yes! Simply select 'Store Pickup' during checkout. In-store collection at our Accra flagship is 100% free. We will package your pieces and send you a WhatsApp alert (${STORE.whatsapp}) when your order is ready for pickup.`,
  },
  {
    category: "Accra Pickup & Local",
    question: "How fast is local delivery within Accra?",
    answer:
      "For addresses within Accra, our local dispatch riders deliver same-day (typically within 1 to 3 hours). Delivery is only GH₵ 20, or completely free for orders over GH₵ 500.",
  },
  {
    category: "Nationwide Delivery",
    question: "Do you deliver to Kumasi, Accra, Takoradi, and other regions?",
    answer:
      "Yes! We deliver across all 16 regions in Ghana daily. Parcels to Kumasi, Cape Coast, Accra, and Takoradi arrive within 24 to 48 hours via trusted couriers (VIP, FedEx, and regional dispatch). Tracking details are sent directly to your WhatsApp.",
  },
  {
    category: "Nationwide Delivery",
    question: "What are the delivery fees for other regions in Ghana?",
    answer:
      "Delivery fees are calculated transparently at checkout: Greater Accra (East Legon / Kasoa) is GH₵ 30; Ashanti (Kumasi) is GH₵ 40; Central (Cape Coast) is GH₵ 35; Western (Takoradi) is GH₵ 45; Eastern is GH₵ 50; and Northern Ghana is GH₵ 70.",
  },
  {
    category: "Nationwide Delivery",
    question: "How do I track my delivery?",
    answer:
      `As soon as your parcel is handed to the rider or courier, you receive an automated confirmation and WhatsApp update (${STORE.whatsapp}) containing the driver or station contact, waybill number, and estimated arrival window.`,
  },
  {
    category: "Payments & MoMo",
    question: "What payment methods do you accept?",
    answer:
      "We accept: 1) Online payment with Ghanaian Mobile Money (MTN MoMo, Telecel Cash) and Visa / Mastercard debit cards powered by Paystack, 2) Cash on Delivery upon physical arrival in Accra, and 3) Direct WhatsApp order confirmation.",
  },
  {
    category: "Payments & MoMo",
    question: "How does Cash on Delivery (COD) work?",
    answer:
      "Select 'Cash on Delivery' at checkout. When our courier delivers to your address in Accra, inspect your package and pay cash or send MoMo to the rider upon receipt.",
  },
  {
    category: "Payments & MoMo",
    question: "Is online payment via Paystack safe?",
    answer:
      "Yes, completely. All payments are processed through Paystack's bank-grade 256-bit SSL encrypted gateway. We never store or see your card or MoMo PINs.",
  },
  {
    category: "Sizing & Quality",
    question: "How do I choose the right size for unisex apparel?",
    answer:
      `Our streetwear tees, hoodies, and cargo shorts feature modern relaxed and boxy silhouettes designed to look great on all genders. If you are unsure between sizes, click the 'Order on WhatsApp' button or message us (${STORE.whatsapp}) with your height and build for personal styling advice.`,
  },
  {
    category: "Sizing & Quality",
    question: "Are your boutique pieces original and authentic?",
    answer:
      "100% authentic and premium quality. Every item in Urban Vault is inspected for heavyweight GSM cotton, reinforced stitching, durable graphics, and flawless hardware before being placed in stock.",
  },
  {
    category: "Exchanges & Returns",
    question: "Can I exchange an item if it does not fit?",
    answer:
      `Yes! If your item doesn't fit as expected, reach out to our team on WhatsApp (${STORE.whatsapp}) within 48 hours of receiving your delivery. As long as the garment is unworn with tags attached, we will gladly exchange it for your preferred size.`,
  },
  {
    category: "Exchanges & Returns",
    question: "What if an item arrives damaged or incorrect?",
    answer:
      `In the rare event of an incorrect or flawed item, contact us immediately on WhatsApp (${STORE.whatsapp}) with a photo. We will arrange a free immediate replacement or full refund.`,
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
