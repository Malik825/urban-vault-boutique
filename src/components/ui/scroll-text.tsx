import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface TextAnimationProps {
  text: string;
  variants?: any; // Kept for backwards compatibility but ignored
  classname?: string;
  as?: React.ElementType;
  letterAnime?: boolean;
  lineAnime?: boolean;
  direction?: "up" | "down" | "left" | "right";
}

export default function TextAnimation({
  text,
  classname = "",
  as: Tag = "h2",
  letterAnime = false,
  lineAnime = false,
  direction = "up",
}: TextAnimationProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;
    const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;

    const ctx = gsap.context(() => {
      // If we're animating lines or letters, we animate the children
      const targets = letterAnime || lineAnime ? el.children : el;

      gsap.fromTo(
        targets,
        { opacity: 0, y: yOffset, x: xOffset, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          x: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: letterAnime ? 0.03 : lineAnime ? 0.1 : 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [direction, letterAnime, lineAnime]);

  const Component = Tag as any;

  if (letterAnime) {
    return (
      <Component ref={containerRef} className={classname}>
        {text.split("").map((char, index) => (
          <span key={index} className="inline-block whitespace-pre" style={{ opacity: 0 }}>
            {char}
          </span>
        ))}
      </Component>
    );
  }

  if (lineAnime) {
    const lines = text.split("\n");
    return (
      <Component ref={containerRef} className={classname}>
        {lines.map((line, index) => (
          <span key={index} className="block" style={{ opacity: 0 }}>
            {line}
          </span>
        ))}
      </Component>
    );
  }

  // Default block animation
  return (
    <Component ref={containerRef} className={classname} style={{ opacity: 0 }}>
      {text}
    </Component>
  );
}
