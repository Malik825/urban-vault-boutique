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
    ],
  }),
  component: FaqsPage,
});

const categories = [
  "All",
  "Orders & Shipping",
  "Device Condition",
  "Payments",
  "Returns & Warranty",
  "Business",
];

const faqs = [
  {
    category: "Orders & Shipping",
    question: "How long does delivery take?",
    answer:
      "Orders placed before 12pm on weekdays are eligible for same-day delivery within Accra. For orders outside Accra, standard shipping takes 2–4 business days. We'll send you a tracking link as soon as your order is dispatched.",
  },
  {
    category: "Orders & Shipping",
    question: "Do you deliver outside Accra?",
    answer:
      "Yes! We ship nationwide across Ghana. Delivery to regional capitals typically takes 2–3 business days. Remote areas may take up to 5 business days. Shipping costs are calculated at checkout.",
  },
  {
    category: "Orders & Shipping",
    question: "Can I pick up my order in person?",
    answer:
      "Absolutely. We have a pickup point in central Accra. Select 'Pickup' at checkout and we'll send you the exact address and available pickup times. Pickups are usually ready within 2–4 hours of ordering.",
  },
  {
    category: "Orders & Shipping",
    question: "How do I track my order?",
    answer:
      "Once your order is confirmed and dispatched, you'll receive a WhatsApp message with your tracking link. You can also contact us anytime on WhatsApp to get a status update.",
  },
  {
    category: "Device Condition",
    question: "What does 'New' mean?",
    answer:
      "A 'New' device is sealed, unused, and in its original manufacturer's packaging. It comes with a full manufacturer warranty and all original accessories.",
  },
  {
    category: "Device Condition",
    question: "What does 'Open Box' mean?",
    answer:
      "An 'Open Box' device has been opened — usually a customer return or display unit — but shows no signs of use. All original accessories are included. It may carry a partial or full warranty depending on the item.",
  },
  {
    category: "Device Condition",
    question: "What does 'Refurbished' mean?",
    answer:
      "A 'Refurbished' device has been professionally inspected, repaired where needed, cleaned, and tested to full functionality. Our lead technician — an Apple-certified professional — personally oversees this process. Refurbished devices come with a 90-day Voltix warranty.",
  },
  {
    category: "Device Condition",
    question: "Who verifies the devices?",
    answer:
      "Our in-house technical team inspects every device before it's listed. Refurbished devices go through a 47-point inspection checklist. No device is listed without passing our quality gate.",
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "We currently accept Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money) and cash on delivery for local pickup. Card payments are coming soon. For large orders, bank transfer is available — contact us.",
  },
  {
    category: "Payments",
    question: "Is it safe to pay on your website?",
    answer:
      "Yes. All transactions on Voltix are processed over secure, encrypted connections. We do not store your payment credentials. For extra peace of mind, you can also pay at pickup.",
  },
  {
    category: "Payments",
    question: "Do you offer instalment plans?",
    answer:
      "We are currently piloting an instalment plan in partnership with a local fintech. Drop us a message on WhatsApp to find out if your chosen device is eligible.",
  },
  {
    category: "Returns & Warranty",
    question: "What is your returns policy?",
    answer:
      "If your device arrives damaged or different from what was listed, we'll arrange a full refund or replacement at no cost to you. Contact us within 48 hours of delivery. Change-of-mind returns are accepted within 7 days for unused, sealed items.",
  },
  {
    category: "Returns & Warranty",
    question: "What warranty do devices come with?",
    answer:
      "New devices carry the full manufacturer warranty. Open Box devices carry the remaining manufacturer warranty. Refurbished devices come with our 90-day Voltix warranty which covers defects and hardware failures.",
  },
  {
    category: "Returns & Warranty",
    question: "How do I make a warranty claim?",
    answer:
      "Simply reach out to us on WhatsApp with your order number and a description or video of the issue. Our technical team will assess and respond within 24 hours with next steps.",
  },
  {
    category: "Business",
    question: "Do you offer bulk or corporate pricing?",
    answer:
      "Yes. We have dedicated pricing for bulk orders of 5+ units and corporate procurement. Please contact our business team via WhatsApp or email and include your device requirements and quantity.",
  },
  {
    category: "Business",
    question: "Can I list my devices on Voltix?",
    answer:
      "We work with verified retailers and businesses. If you'd like to list devices on our platform, reach out to us. All partner retailers must pass our verification process to maintain the quality our buyers trust.",
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
            Everything you need to know about buying from Voltix. Can't find an answer?{" "}
            <a
              href={whatsappLink("Hi Voltix, I have a question.")}
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
                <a href={whatsappLink("Hi Voltix, I have a question.")} target="_blank" rel="noreferrer">
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
