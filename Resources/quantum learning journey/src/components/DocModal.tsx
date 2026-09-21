import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronRight, Printer, X } from "lucide-react";
import type { DocSpec } from "../docs/atoms";
import { cn } from "../utils/cn";

export function DocModal({
  open, onClose, spec,
}: {
  open: boolean; onClose: () => void; spec: DocSpec;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(spec.sections[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  // reset scroll + active section when the document itself changes
  useEffect(() => {
    if (!open) return;
    setActive(spec.sections[0]?.id ?? "");
    scrollRef.current?.scrollTo({ top: 0 });
  }, [open, spec]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      let cur = spec.sections[0]?.id ?? "";
      for (const s of spec.sections) {
        const node = document.getElementById(s.id);
        if (node && node.getBoundingClientRect().top - el.getBoundingClientRect().top < 90) cur = s.id;
      }
      setActive(cur);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [open, spec]);

  const go = (id: string) => {
    const node = document.getElementById(id);
    const el = scrollRef.current;
    if (node && el) el.scrollTo({ top: node.offsetTop - 16, behavior: "smooth" });
  };

  const { Body } = spec;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="doc-modal-root fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="doc-backdrop absolute inset-0 bg-void/85 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="doc-modal-panel relative w-full max-w-[1180px] h-full max-h-[92vh] rounded-2xl border border-line-bright bg-panel shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="shrink-0 h-14 px-5 md:px-6 border-b border-line flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-3 min-w-0">
                <BookOpen size={15} className="text-quantum shrink-0 translate-y-0.5" />
                <h2 className="display text-lg md:text-xl font-light tracking-tight truncate">{spec.title}</h2>
                <span className="mono text-[9.5px] tracking-[0.2em] text-faint hidden lg:block shrink-0">
                  {spec.subtitle}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="chip !py-1.5 !px-3 cursor-pointer hover:!text-quantum hover:!border-quantum/50 transition-colors hidden sm:inline-flex"
                >
                  <Printer size={11} /> print
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-muted hover:text-ink hover:border-line-bright transition-colors cursor-pointer"
                  aria-label="close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex">
              <nav className="no-print hidden md:block w-[236px] shrink-0 border-r border-line overflow-y-auto py-4 px-3">
                <div className="mono text-[9px] tracking-[0.25em] text-faint px-2 mb-2.5">CONTENTS</div>
                {spec.sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => go(s.id)}
                    className={cn(
                      "w-full text-left rounded-lg px-2.5 py-1.5 mb-0.5 transition-colors cursor-pointer flex items-start gap-2",
                      active === s.id ? "bg-quantum/[0.10] text-quantum" : "text-muted hover:text-ink hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="mono text-[9px] shrink-0 pt-0.5 w-7 text-faint">{s.n}</span>
                    <span className="text-[12px] leading-snug">{s.t}</span>
                  </button>
                ))}
                <div className="mono text-[9px] text-faint px-2.5 mt-4 pt-3 border-t border-line leading-relaxed">
                  press <span className="text-ink">Esc</span> to close
                </div>
              </nav>

              <div ref={scrollRef} className="doc-scroll flex-1 min-w-0 overflow-y-auto px-5 md:px-10 py-7">
                <Body />
                <div className="h-16" />
              </div>
            </div>

            <div className="no-print shrink-0 h-9 border-t border-line px-5 md:px-6 flex items-center gap-5 overflow-x-auto">
              {spec.footer.map(([k, v, c]) => (
                <span key={k} className="mono text-[10px] whitespace-nowrap shrink-0">
                  <span className="text-faint">{k} </span>
                  <span style={{ color: c }}>{v}</span>
                </span>
              ))}
              <span className="mono text-[10px] text-faint ml-auto shrink-0 hidden md:block">
                <ChevronRight size={9} className="inline" /> all identities verified numerically
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
