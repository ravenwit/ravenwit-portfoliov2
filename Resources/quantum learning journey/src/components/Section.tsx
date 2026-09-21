import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function SectionHead({
  index,
  kicker,
  title,
  lede,
  accent = "gold",
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  accent?: "gold" | "cyan" | "rose";
}) {
  const color =
    accent === "cyan" ? "text-quantum" : accent === "rose" ? "text-rose" : "text-gold";
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-7"
    >
      <div className="flex items-center gap-3 mb-3.5">
        <span className={cn("mono text-[11px] tracking-[0.3em]", color)}>{index}</span>
        <div className="hairline w-12 md:w-20" />
        <span className="mono text-[10px] tracking-[0.3em] text-faint uppercase">{kicker}</span>
      </div>
      <h2 className="display text-2xl md:text-[34px] leading-[1.06] font-light tracking-tight max-w-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-3.5 max-w-3xl text-muted text-[13.5px] leading-relaxed font-light">
          {lede}
        </p>
      )}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
