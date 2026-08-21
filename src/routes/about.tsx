import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Globe,
  Heart,
  LayoutGrid,
  MessageCircle,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Reveal } from "@/components/reveal";
import TextAnimation from "@/components/ui/scroll-text";
import { STORE, whatsappLink } from "@/lib/store-data";

import laptopImg from "@/assets/laptop.jpg";
import phoneImg from "@/assets/phone.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${STORE.name} — Premium Electronics in ${STORE.city}` },
      {
        name: "description",
        content: `Learn about ${STORE.name}, ${STORE.city}'s most trusted electronics retailer. Discover our story, values and commitment to verified, honest tech retail.`,
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "1,400+", label: "Verified devices listed" },
  { value: "48h", label: "Average turnaround" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "3+", label: "Years of trusted retail" },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Verified Stock",
    description: "Every device is physically inspected and graded. No phantom listings — if it's live, it's in stock.",
    span: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Honest Grading",
    description: "We use clear, standardised condition grades — New, Open Box, Refurbished — so you always know what you're getting.",
    span: "col-span-1 md:col-span-1 row-span-2 bg-primary text-primary-foreground",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Zap,
    title: "Instant Enquiries",
    description: "Connect directly with our team on WhatsApp within minutes. No bots, no hold music.",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    icon: Globe,
    title: "Pan-African Vision",
    description: "Starting in Accra, growing across West Africa. We believe every market deserves premium tech retail.",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Same-day delivery within Accra for orders placed before noon. Nationwide shipping with tracking.",
    span: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "We reinvest in local repair ecosystems, student tech programmes, and certified refurbishment training.",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
];

const team = [
  {
    name: "Kwame Mensah",
    role: "Founder & CEO",
    img: phoneImg,
    bio: "Former software engineer who saw the gap in honest, verified tech retail in West Africa.",
  },
  {
    name: "Ama Boateng",
    role: "Head of Operations",
    img: laptopImg,
    bio: "Supply chain specialist with 8 years optimising electronics logistics across Ghana.",
  },
  {
    name: "Kofi Asante",
    role: "Lead Device Technician",
    img: phoneImg,
    bio: "Apple-certified technician overseeing all device inspection and grading standards.",
  },
];

function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !parallaxBgRef.current || !heroContentRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax background
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
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }
      );

      // Marquee animation
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          x: "-33.33%",
          duration: 25,
          ease: "none",
          repeat: -1, // Infinite
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Parallax Hero */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        <div 
          ref={parallaxBgRef}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <img src={laptopImg} alt="Abstract tech background" className="h-full w-full object-cover opacity-10 dark:opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl container-x text-center px-4">
          <div ref={heroContentRef}>
            <Badge variant="outline" className="mb-8 rounded-full border px-5 py-2 text-sm font-semibold backdrop-blur-md bg-background/50">
              <Star className="mr-2 h-4 w-4 text-primary" />
              {STORE.city}'s most trusted electronics retailer
            </Badge>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl text-foreground">
              We're on a mission to make{" "}
              <span className="text-gradient-brand">tech retail honest.</span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {STORE.name} was born out of frustration — too many listings with wrong specs, phantom stock,
              and zero accountability. We built the store we always wished existed.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee Stats */}
      <section className="border-y border-border bg-surface-muted py-12 overflow-hidden flex whitespace-nowrap">
        <div 
          ref={marqueeRef}
          className="flex items-center gap-12 sm:gap-24"
        >
          {[...stats, ...stats, ...stats].map((s, i) => (
            <div key={i} className="inline-flex items-center gap-4">
              <span className="font-display text-5xl font-extrabold text-gradient-brand">{s.value}</span>
              <span className="text-lg font-medium text-muted-foreground uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="section-pad py-32">
        <div className="mx-auto max-w-7xl container-x">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Our story</p>
                <TextAnimation
                  as="h2"
                  text="Built in Accra. Built for Africa."
                  classname="mt-4 text-4xl font-extrabold sm:text-5xl"
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                  }}
                />
                <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
                  <p>
                    In 2021, our founder walked into a popular electronics market in Accra looking for a refurbished MacBook.
                    He left hours later with a device that had completely different specs from what was advertised — and no recourse.
                  </p>
                  <p>
                    That experience became {STORE.name}. We set out to build a platform where every listing is physically verified,
                    every condition grade is standardised, and every enquiry connects you to a real human being who can answer your questions.
                  </p>
                  <p>
                    Today we serve thousands of buyers and hundreds of verified retailers across Ghana, and we're just getting started.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl group">
                <img src={laptopImg} alt="Voltix store" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <Badge className="bg-background/90 text-foreground backdrop-blur-md border-transparent px-4 py-2 text-sm">
                    <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
                    Accra, Ghana — Est. 2021
                  </Badge>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bento Grid Values */}
      <section className="section-pad bg-surface-muted py-32">
        <div className="mx-auto max-w-7xl container-x">
          <div className="text-center mb-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">What drives us</p>
            <TextAnimation
              as="h2"
              text="Our core principles"
              classname="mt-4 text-4xl font-extrabold sm:text-5xl"
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-3 auto-rows-[220px]">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className={`${v.span}`}>
                <div className={`group h-full rounded-[2rem] border border-border/50 p-8 shadow-card hover-lift transition-all flex flex-col justify-between ${v.span.includes('bg-primary') ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card'}`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${v.span.includes('bg-primary') ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <v.icon className={`h-6 w-6 ${v.iconColor || 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{v.title}</h3>
                    <p className={`mt-3 text-base leading-relaxed ${v.span.includes('bg-primary') ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>{v.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-pad py-32">
        <div className="mx-auto max-w-7xl container-x">
          <div className="text-center mb-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">The people</p>
            <TextAnimation
              as="h2"
              text="Meet the team"
              classname="mt-4 text-4xl font-extrabold sm:text-5xl"
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
            />
          </div>
          <div className="grid gap-12 sm:grid-cols-3">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 100}>
                <div className="group text-center">
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full border-[6px] border-surface-muted shadow-xl">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-foreground">{member.name}</h3>
                  <p className="mt-1 text-base font-bold uppercase tracking-widest text-primary">{member.role}</p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-xs mx-auto">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="section-pad pb-32">
          <div className="mx-auto max-w-7xl container-x">
            <div className="relative overflow-hidden rounded-[3rem] bg-brand-gradient dark:bg-brand-gradient/80 px-8 py-24 text-center shadow-glow sm:px-16">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className="relative z-10">
                <Badge className="mb-8 bg-white/20 text-primary-foreground border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-bold">
                  <Award className="mr-2 h-4 w-4" /> Trusted by thousands across Ghana
                </Badge>
                <h2 className="font-display text-4xl font-extrabold text-primary-foreground sm:text-6xl max-w-3xl mx-auto leading-tight">
                  Ready to find your next device?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-xl text-primary-foreground/90">
                  Browse over 1,400 verified listings updated in real time. No fake specs, no phantom stock.
                </p>
                <div className="mt-12 flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-10 h-14 text-base font-bold shadow-xl hover:-translate-y-1 transition-transform">
                    <Link to="/products" search={{}}>
                      Shop now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-10 h-14 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold backdrop-blur-sm">
                    <a href={whatsappLink("Hi Voltix!")} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp us
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
