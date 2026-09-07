"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "@/lib/use-in-view";

export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({
    once: true,
    rootMargin: "-100px",
  });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`reveal-up${inView ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
