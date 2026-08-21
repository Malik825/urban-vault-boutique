import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { gsap } from "@/lib/gsap";
import {
  ArrowRight,
  BadgeCheck,
  Building,
  Headset,
  MapPin,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Reveal } from "@/components/reveal";
import TextAnimation from "@/components/ui/scroll-text";
import { STORE, whatsappLink } from "@/lib/store-data";
import phoneImg from "@/assets/phone.jpg";
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
    description: "Every device sold on our platform is physically inspected, graded, and verified by our in-house technicians. No fake specs or hidden defects.",
    icon: ShieldCheck,
    img: phoneImg,
    category: "For Buyers"
  },
  {
    title: "Secure Logistics",
    description: "We handle the entire delivery process. Get same-day delivery within Accra and secure, tracked shipping nationwide across Ghana.",
    icon: Truck,
    img: laptopImg,
    category: "For Buyers & Retailers"
  },
  {
    title: "Device Trade-ins",
    description: "Upgrade your current device by trading it in. We offer competitive valuations and instant credit towards your next purchase.",
    icon: Repeat2,
    img: phoneImg,
    category: "For Buyers"
  },
  {
    title: "Retailer Dashboard",
    description: "Manage your inventory, track orders, and monitor your sales performance with our intuitive dashboard built specifically for electronics retailers.",
    icon: Building,
    img: laptopImg,
    category: "For Retailers"
  },
  {
    title: "Verified Seller Status",
    description: "Pass our vetting process to earn the Verified Seller badge, increasing buyer trust and boosting your visibility on our platform.",
    icon: BadgeCheck,
    img: phoneImg,
    category: "For Retailers"
  }
];

function InteractiveStickyScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="relative mx-auto max-w-7xl container-x flex items-start gap-12">
      {/* Left Sticky Content */}
      <div className="hidden lg:flex w-1/2 sticky top-32 flex-col gap-6 py-20 pr-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Capabilities</p>
        <h2 className="font-display text-4xl font-extrabold sm:text-5xl leading-[1.1]">
          Everything you need to <span className="text-gradient-brand">thrive in tech</span>.
        </h2>
        <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
          Whether you're buying your first MacBook or scaling a nationwide electronics chain, our infrastructure is built to support you.
        </p>
      </div>

      {/* Right Scrolling Features */}
      <div className="w-full lg:w-1/2 flex flex-col gap-24 py-20">
        {allServices.map((service, i) => (
          <Reveal key={i}>
            <div className="group">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl">
              <img src={service.img} alt={service.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <Badge className="mb-4 bg-primary/90 text-primary-foreground border-transparent">
                  {service.category}
                </Badge>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                </div>
                <p className="text-base text-white/80 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !parallaxBgRef.current || !heroContentRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax effect on scroll
      gsap.to(parallaxBgRef.current, {
        yPercent: 50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Entry animation
      gsap.fromTo(
        heroContentRef.current,
        { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Parallax Hero */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center justify-center text-center">
        <div 
          ref={parallaxBgRef}
          className="absolute inset-0 z-0"
        >
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background/0 to-background" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl container-x">
          <div ref={heroContentRef}>
            <Badge variant="outline" className="mb-8 rounded-full border px-5 py-2 text-sm font-semibold backdrop-blur-md bg-background/50 shadow-sm">
              <Building className="mr-2 h-4 w-4 text-primary" />
              Infrastructure for Retail
            </Badge>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl text-foreground">
              Services for <span className="text-gradient-brand">Elevate your</span> tech experience.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
              We offer more than just products. Benefit from end-to-end logistics, rigorous quality control, and dedicated B2B support.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Scroll Section */}
      <section className="bg-surface-muted border-t border-border">
        <InteractiveStickyScroll />
      </section>

      {/* CTA */}
      <Reveal>
        <section className="section-pad py-32">
          <div className="mx-auto max-w-5xl container-x">
            <div className="overflow-hidden rounded-[3rem] bg-card border border-border/50 px-8 py-24 text-center shadow-2xl sm:px-16 relative">
              <div className="absolute inset-0 bg-primary/5" />
              <div className="relative z-10">
                <h2 className="font-display text-4xl font-extrabold text-foreground sm:text-5xl">
                  Need a Custom Solution?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-xl text-muted-foreground leading-relaxed">
                  We also offer corporate procurement, bulk purchasing, and custom logistics solutions for enterprise clients.
                </p>
                <div className="mt-12 flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="rounded-full px-10 h-14 text-base font-bold shadow-xl hover:-translate-y-1 transition-transform">
                    <a href={whatsappLink("Hi Voltix, I'd like to discuss a custom solution.")} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-5 w-5" /> Contact Sales
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <SiteFooter />
    </div>
  );
}
