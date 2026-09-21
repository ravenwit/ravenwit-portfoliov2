import type { ReactNode } from "react";
import { TeX } from "../components/TeX";

export const H = ({ id, n, children }: { id: string; n: string; children: ReactNode }) => (
  <h3 id={id} className="scroll-mt-6 flex items-baseline gap-3 mt-10 mb-4 first:mt-0">
    <span className="mono text-[10px] tracking-[0.25em] text-quantum shrink-0">{n}</span>
    <span className="display text-[22px] md:text-[26px] font-light leading-tight">{children}</span>
  </h3>
);

export const H2 = ({ children }: { children: ReactNode }) => (
  <h4 className="mono text-[10.5px] tracking-[0.22em] text-gold mt-7 mb-3 uppercase">{children}</h4>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-[13.5px] leading-[1.75] text-muted mb-3.5">{children}</p>
);

export const M = ({ children, tag }: { children: string; tag?: string }) => (
  <div className="relative my-4 rounded-xl border border-line bg-white/[0.022] px-4 py-3.5">
    <TeX block className="!text-[0.92rem]">{children}</TeX>
    {tag && <span className="absolute right-3 top-2 mono text-[9px] text-faint">({tag})</span>}
  </div>
);

export const Note = ({
  kind = "info", title, children,
}: { kind?: "info" | "warn" | "key"; title: string; children: ReactNode }) => {
  const c = kind === "warn" ? "#fb5c7a" : kind === "key" ? "#7CFFB2" : "#e8b45c";
  return (
    <div className="my-4 rounded-xl border px-4 py-3.5" style={{ borderColor: c + "55", background: c + "0e" }}>
      <div className="mono text-[9.5px] tracking-[0.22em] mb-1.5" style={{ color: c }}>{title}</div>
      <div className="text-[12.5px] leading-[1.7] text-muted">{children}</div>
    </div>
  );
};

export const Step = ({ n, children }: { n: string; children: ReactNode }) => (
  <div className="flex gap-3 mb-3">
    <span className="mono text-[10px] text-faint pt-1 shrink-0 w-8">{n}</span>
    <div className="min-w-0 flex-1 text-[13.5px] leading-[1.75] text-muted">{children}</div>
  </div>
);

export const Tbl = ({ head, rows }: { head: string[]; rows: (string | ReactNode)[][] }) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full mono text-[11.5px]">
      <thead>
        <tr className="text-faint text-[9px] tracking-[0.2em] border-b border-line">
          {head.map((h) => <th key={h} className="text-left font-normal py-2 pr-4 whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-line/40">
            {r.map((c, j) => <td key={j} className="py-2 pr-4 align-top text-ink/85">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Refs = ({ items }: { items: [string, string][] }) => (
  <div className="space-y-1.5 mb-4">
    {items.map(([a, b], i) => (
      <div key={i} className="flex gap-3 text-[12px] leading-relaxed border-b border-line/40 pb-1.5">
        <span className="mono text-[10px] text-faint shrink-0 w-6">[{i + 1}]</span>
        <span className="text-muted"><span className="text-ink">{a}</span> — {b}</span>
      </div>
    ))}
  </div>
);

export interface DocSection { id: string; n: string; t: string }
export interface DocSpec {
  title: string;
  subtitle: string;
  sections: DocSection[];
  footer: [string, string, string][];
  Body: () => ReactNode;
}
