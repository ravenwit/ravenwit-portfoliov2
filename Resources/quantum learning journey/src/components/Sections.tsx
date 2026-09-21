import { Equal, Layers, MoveDiagonal, Repeat } from "lucide-react";
import { SectionHead, Reveal } from "./Section";
import { TeX } from "./TeX";

/* ---------------------------------------------------------------- */
function Card({
  icon,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 md:p-7">
      <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4 flex items-center gap-2">
        {icon} {eyebrow}
      </div>
      {children}
    </div>
  );
}

function ReflectionDiagram() {
  const deg = (d: number) => (d * Math.PI) / 180;
  const P = (r: number, d: number): [number, number] => [200 + r * Math.cos(deg(d)), 150 - r * Math.sin(deg(d))];
  const [vx, vy] = P(118, -20);
  const [mx, my] = P(132, -20);
  const [bx, by] = P(132, 160);
  const [px, py] = P(112, 70);
  const [rx, ry] = P(112, -110);

  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-[420px] mx-auto">
      <circle cx="200" cy="150" r="118" fill="none" stroke="rgba(236,231,219,0.12)" strokeDasharray="2 6" />
      {/* mirror axis along v */}
      <line x1={bx} y1={by} x2={mx} y2={my} stroke="rgba(232,180,92,0.4)" strokeWidth="1" strokeDasharray="4 5" />
      {/* perpendicular drop */}
      <line x1={px} y1={py} x2={rx} y2={ry} stroke="rgba(236,231,219,0.18)" strokeWidth="1" strokeDasharray="2 4" />
      {/* vectors */}
      <line x1="200" y1="150" x2={vx} y2={vy} stroke="#e8b45c" strokeWidth="2.2" />
      <line x1="200" y1="150" x2={px} y2={py} stroke="#6fdcf7" strokeWidth="2.2" />
      <line x1="200" y1="150" x2={rx} y2={ry} stroke="#a78bfa" strokeWidth="2.2" />
      <circle cx={vx} cy={vy} r="3.5" fill="#e8b45c" />
      <circle cx={px} cy={py} r="3.5" fill="#6fdcf7" />
      <circle cx={rx} cy={ry} r="3.5" fill="#a78bfa" />
      <circle cx="200" cy="150" r="3" fill="#ece7db" />
      <text x={vx + 10} y={vy - 6} fontSize="13" className="mono" fill="#f0cd8a">v</text>
      <text x={px - 4} y={py - 12} fontSize="13" className="mono" fill="#9be9fb">ψ</text>
      <text x={rx - 8} y={ry + 20} fontSize="13" className="mono" fill="#c4b5fd">S(v)·ψ</text>
      <text x="200" y="40" textAnchor="middle" fontSize="10" letterSpacing="3" className="mono" fill="rgba(143,141,156,0.9)">
        REFLECTION ACROSS THE RAY
      </text>
    </svg>
  );
}

export function SetupSection() {
  return (
    <section className="relative">
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <SectionHead
          index="▪"
          kicker="The instrument"
          title={
            <>
              Rays become <span className="italic gold-grad">yes/no questions.</span>
            </>
          }
          lede={
            <>
              To every unit vector we attach a reflection observable{" "}
              <TeX>{"\\hat S_i = 2|v_i\\rangle\\langle v_i| - \\mathbb{I}"}</TeX> — a spin-like
              dichotomic measurement living in a single three-level system. No entanglement, no
              separated labs: contextuality out of pure geometry.
            </>
          }
        />

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-5">
            <Reveal>
              <Card icon={<Repeat size={12} className="text-gold" />} eyebrow="A ±1 OBSERVABLE FROM A RAY">
                <TeX block>
                  {"\\hat S_i \\;:=\\; 2\\,|v_i\\rangle\\langle v_i| - \\mathbb{I}"}
                </TeX>
                <p className="text-[13.5px] text-muted leading-relaxed">
                  It reflects space across the ray <TeX>{"|v_i\\rangle"}</TeX>: the ray itself is
                  the <span className="text-gold mono">+1</span> eigendirection, everything
                  orthogonal to it flips sign (<span className="text-violet mono">−1</span>).
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.06}>
              <Card icon={<Equal size={12} className="text-gold" />} eyebrow="Genuinely dichotomic — S² = 𝕀">
                <TeX block>
                  {"\\hat S_i^2 = 4|v_i\\rangle\\langle v_i| - 4|v_i\\rangle\\langle v_i| + \\mathbb{I} = \\mathbb{I} \\quad\\Longrightarrow\\quad \\operatorname{spec}(\\hat S_i)=\\{+1,-1\\}"}
                </TeX>
              </Card>
            </Reveal>

            <Reveal delay={0.12}>
              <Card icon={<MoveDiagonal size={12} className="text-quantum" />} eyebrow="Compatibility = orthogonality">
                <TeX block>
                  {"[\\hat S_i,\\, \\hat S_{i+1}] = 0 \\iff [P_i, P_{i+1}] = 0 \\iff \\langle v_i \\,|\\, v_{i+1}\\rangle = 0"}
                </TeX>
                <p className="text-[13.5px] text-muted leading-relaxed">
                  Rank-1 projectors commute only when their rays are orthogonal (or equal). So the
                  five measurement contexts of KCBS — the star edges — must be built from{" "}
                  <span className="text-ink">mutually orthogonal neighbours</span>. That single
                  demand fixes the entire geometry.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.18}>
              <Card icon={<Layers size={12} className="text-quantum" />} eyebrow="The five contexts">
                <div className="flex flex-wrap gap-2">
                  {["{S₁, S₂}", "{S₂, S₃}", "{S₃, S₄}", "{S₄, S₅}", "{S₅, S₁}"].map((c) => (
                    <span key={c} className="chip !text-quantum/90 !border-quantum/25">{c}</span>
                  ))}
                </div>
                <p className="text-[12.5px] text-faint mt-4 mono">
                  indices mod 5 — the ring closes: v₆ ≡ v₁
                </p>
              </Card>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="card p-6 md:p-8 lg:sticky lg:top-24">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2">WHAT A MEASUREMENT DOES</div>
            <ReflectionDiagram />
            <TeX block className="!text-base text-center text-ink/90">
              {"\\hat S(v)\\,|\\psi\\rangle = 2\\,\\langle v|\\psi\\rangle\\,|v\\rangle - |\\psi\\rangle"}
            </TeX>
            <p className="text-[13px] text-muted leading-relaxed mt-3 text-center max-w-md mx-auto">
              One qc question per ray: “does the state line up with me — or lie in my orthogonal
              plane?” KCBS asks five such questions that pairwise share answers.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

