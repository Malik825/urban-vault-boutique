import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building,
  CheckCircle2,
  Cpu,
  Globe,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { STORE, whatsappLink } from "@/lib/store-data";
import laptopImg from "@/assets/laptop.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services — ${STORE.name}` },
      {
        name: "description",
        content: `Discover our premium services for buyers and retailers. From secure logistics and quality assurance to business procurement and device trade-ins.`,
      },
    ],
  }),
  component: ServicesPage,
});

const allServices = [
  {
    title: "Quality Assurance",
    description: "Every device is physically inspected, graded, and verified by our in-house technicians. No fake specs or hidden defects.",
    icon: ShieldCheck,
    category: "For Buyers",
    colSpan: "md:col-span-2 lg:col-span-2",
    bgClass: "bg-card hover:bg-surface-muted",
  },
  {
    title: "Secure Logistics",
    description: "Same-day delivery within Accra and secure, tracked shipping nationwide.",
    icon: Truck,
    category: "Universal",
    colSpan: "md:col-span-1 lg:col-span-1",
    bgClass: "bg-card hover:bg-surface-muted",
  },
  {
    title: "Device Trade-ins",
    description: "Upgrade your current device by trading it in for instant credit.",
    icon: Repeat2,
    category: "For Buyers",
    colSpan: "md:col-span-1 lg:col-span-1",
    bgClass: "bg-card hover:bg-surface-muted",
  },
  {
    title: "Retailer Dashboard",
    description: "Manage inventory, track orders, and monitor sales performance with our intuitive dashboard built specifically for electronics retailers.",
    icon: Building,
    category: "For Retailers",
    colSpan: "md:col-span-2 lg:col-span-2",
    bgClass: "bg-card hover:bg-surface-muted",
  },
  {
    title: "Verified Seller Status",
    description: "Pass our vetting process to earn the Verified Seller badge, increasing buyer trust and boosting your visibility on our platform.",
    icon: BadgeCheck,
    category: "For Retailers",
    colSpan: "md:col-span-3 lg:col-span-3",
    bgClass: "bg-card hover:bg-surface-muted",
  },
];

const metrics = [
  { value: "10k+", label: "Devices Verified", icon: CheckCircle2 },
  { value: "24h", label: "Average Delivery", icon: Zap },
  { value: "50+", label: "Verified Retailers", icon: Globe },
  { value: "99%", label: "Satisfaction Rate", icon: Sparkles },
];

function HeroSection() {

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={laptopImg} alt="Services Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-20 container-x mx-auto text-center w-full max-w-5xl">
        <div className="flex flex-col items-center">
          <Badge variant="outline" className="mb-8 rounded-full border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md">
            <Sparkles className="mr-2 h-4 w-4" />
            Infrastructure for the Future
          </Badge>
          
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white mb-8">
            Elevate your <br className="hidden sm:block" />
            <span className="text-primary">tech experience.</span>
          </h1>
          
          <p className="max-w-2xl text-xl sm:text-2xl text-white/80 leading-relaxed mb-12">
            Beyond commerce. We provide end-to-end logistics, rigorous quality control, and dedicated B2B support to power your growth.
          </p>

          <Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold shadow-xl">
            Explore Capabilities <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function BentoServices() {
  return (
    <section className="py-32 bg-background relative z-20">
      <div className="container-x mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6">Built for scale.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to buy, sell, and manage electronics securely.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {allServices.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded-[2rem] border border-border ${service.bgClass} ${service.colSpan} p-10 shadow-lg transition-all duration-300`}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="h-7 w-7 text-primary" />
                    </div>
                    <Badge variant="secondary" className="rounded-full px-4">
                      {service.category}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="py-24 bg-surface-muted relative overflow-hidden border-y border-border">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="container-x mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {metrics.map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                <metric.icon className="w-8 h-8" />
              </div>
              <h4 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">{metric.value}</h4>
              <p className="text-lg font-medium text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 bg-background relative">
      <div className="container-x mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-card border border-border px-8 py-24 text-center shadow-xl sm:px-16"
        >
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm rounded-full">
              Enterprise Solutions
            </Badge>
            <h2 className="font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl tracking-tight mb-8">
              Need a Custom Solution?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed mb-12">
              We offer corporate procurement, bulk purchasing, and custom logistics solutions tailored specifically for enterprise clients.
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-md transition-all">
                <a href={whatsappLink("Hi Voltix, I'd like to discuss a custom solution.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-3 h-6 w-6" /> Contact Sales
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <SiteHeader />
      
      <main>
        <HeroSection />
        <BentoServices />
        <MetricsSection />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
}
