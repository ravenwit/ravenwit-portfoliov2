import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "../utils/cn";

export function TeX({
  children,
  block = false,
  className,
}: {
  children: string;
  block?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: block,
        throwOnError: false,
        trust: true,
        strict: false,
      }),
    [children, block]
  );

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
