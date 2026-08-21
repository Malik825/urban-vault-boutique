import { useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/** Reveals children with a subtle rise + fade once they scroll into view using GSAP. */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: delay / 1000,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // trigger when top of element hits 85% from top of viewport
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  const Component = Tag as any;

  return (
    <Component ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Component>
  );
}
