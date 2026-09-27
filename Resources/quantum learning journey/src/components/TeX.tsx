import { useMemo, type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "../utils/cn";

export function TeX({
  children,
  block = false,
  className,
}: {
  children: ReactNode;
  block?: boolean;
  className?: string;
}) {
  const textContent = useMemo(() => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) {
      return children
        .map((c) => (c == null ? "" : typeof c === "string" ? c : String(c)))
        .join("");
    }
    return children != null ? String(children) : "";
  }, [children]);

  const html = useMemo(() => {
    try {
      return katex.renderToString(textContent, {
        displayMode: block,
        throwOnError: false,
        trust: true,
        strict: false,
      });
    } catch (err) {
      console.error("KaTeX rendering error for:", textContent, err);
      return `<span class="katex-error text-rose font-mono text-xs">${textContent}</span>`;
    }
  }, [textContent, block]);

  if (block) {
    return (
      <div
        className={cn("math-display text-[1.05rem] md:text-[1.15rem]", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span className={cn("whitespace-nowrap", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
