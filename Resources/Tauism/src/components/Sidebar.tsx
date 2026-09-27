import React, { useState, useEffect, useTransition } from 'react';
import { PRESETS } from '../constants';
import { ParamState } from '../types';
import { Settings2, RefreshCw, Box, Activity } from 'lucide-react';

interface SidebarProps {
  params: ParamState;
  updateParam: (key: string, value: any) => void;
  preset: string;
  onPresetChange: (name: string) => void;
  wireframe: boolean;
  setWireframe: (val: boolean) => void;
  resolution: number;
  setResolution: (val: number) => void;
}

// ----------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------

/** Equation Input blocks upstream updates until blur/Enter to prevent crashing math evaluate */
function EquationInput({
  value,
  onChange,
  placeholder = ''
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleBlur = () => {
    if (localVal !== value) onChange(localVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  return (
    <input
      type="text"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-inner rounded-none"
    />
  );
}

/** Transition Range prevents heavy main-thread computations from freezing the UI slider */
function TransitionRange({
  value,
  min,
  max,
  step,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const [localVal, setLocalVal] = useState(value);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={localVal}
      onChange={(e) => {
        const num = parseFloat(e.target.value);
        setLocalVal(num);
        // Dispatch upstream update into a background transition, unblocking the UI thread
        startTransition(() => {
          onChange(num);
        });
      }}
      className="w-full appearance-none bg-zinc-800 h-1 outline-none slider-thumb-industrial"
      style={{
        WebkitAppearance: 'none',
      }}
    />
  );
}

// ----------------------------------------------------
// MAIN SIDEBAR
// ----------------------------------------------------

export function Sidebar({
  params,
  updateParam,
  preset,
  onPresetChange,
  wireframe,
  setWireframe,
  resolution,
  setResolution
}: SidebarProps) {
  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-700 flex flex-col h-full overflow-y-auto font-sans text-zinc-300">
      <style dangerouslySetInnerHTML={{
        __html: `
        .slider-thumb-industrial::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border-radius: 0;
        }
        .slider-thumb-industrial::-moz-range-thumb {
          width: 12px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border: none;
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
        }
      `}} />

      {/* HEADER */}
      <div className="p-5 border-b-2 border-zinc-700 bg-zinc-950/50 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-zinc-100">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Manifold.SYS</h1>
        </div>
        <div className="flex justify-between items-center text-xs font-mono text-zinc-500 mt-2 border-t border-zinc-800 pt-2">
          <span>STAT: <span className="text-emerald-400">ONLINE</span></span>
          <span>V 1.0.4</span>
        </div>
      </div>

      <div className="p-5 space-y-8 flex-1 custom-scrollbar">

        {/* TOPOLOGY PRESET */}
        <div className="space-y-3 relative before:absolute before:-left-5 before:top-2 before:h-8 before:w-1 before:bg-zinc-600">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Topology Model
          </label>
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => onPresetChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-none px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="Custom" disabled>CUSTOM CONFIG</option>
              {Object.keys(PRESETS).map((p) => (
                <option key={p} value={p}>[{p.toUpperCase()}]</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
          </div>
        </div>

        {/* BASE SPACE */}
        <div className="space-y-4 relative before:absolute before:-left-5 before:top-2 before:h-24 before:w-1 before:bg-zinc-700">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="w-3 h-3" />
            Base Curve (S¹)
          </label>

          <div className="space-y-2 bg-zinc-950 p-3 border border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Radius (R)</span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/30 px-1 border border-emerald-900/50">{params.R.toFixed(1)}</span>
            </div>
            <TransitionRange min={0} max={10} step={0.1} value={params.R} onChange={(v) => updateParam('R', v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">u.Min</span>
              <EquationInput value={params.uMin} onChange={(v) => updateParam('uMin', v)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">u.Max</span>
              <EquationInput value={params.uMax} onChange={(v) => updateParam('uMax', v)} />
            </div>
          </div>
        </div>

        {/* STRUCTURAL GROUP */}
        <div className="space-y-4 relative before:absolute before:-left-5 before:top-2 before:h-12 before:w-1 before:bg-zinc-700">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Structural Twist (SO(2))
          </label>

          <div className="space-y-2 bg-zinc-950 p-3 border border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Topological Factor (τ)</span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/30 px-1 border border-emerald-900/50">{params.tau.toFixed(2)}</span>
            </div>
            <TransitionRange min={-5} max={5} step={0.1} value={params.tau} onChange={(v) => updateParam('tau', v)} />
          </div>
        </div>

        {/* FIBER */}
        <div className="space-y-4 relative before:absolute before:-left-5 before:top-2 before:h-32 before:w-1 before:bg-zinc-700">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Cross-Section (F)
          </label>

          <div className="space-y-3 bg-zinc-950 p-3 border border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Fiber Equ. f₁(v)</span>
              <EquationInput value={params.f1} onChange={(v) => updateParam('f1', v)} placeholder="Function 1" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Fiber Equ. f₂(v)</span>
              <EquationInput value={params.f2} onChange={(v) => updateParam('f2', v)} placeholder="Function 2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">v.Min</span>
              <EquationInput value={params.vMin} onChange={(v) => updateParam('vMin', v)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">v.Max</span>
              <EquationInput value={params.vMax} onChange={(v) => updateParam('vMax', v)} />
            </div>
          </div>
        </div>

        {/* ENGINE PIPELINE */}
        <div className="space-y-4 pt-6 border-t border-zinc-800 relative before:absolute before:-left-5 before:top-8 before:h-16 before:w-1 before:bg-zinc-700">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Box className="w-3 h-3" />
            Render Pipeline
          </label>

          <div className="space-y-2 bg-zinc-950 p-3 border border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Subdivision</span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/30 px-1 border border-emerald-900/50">{resolution}px</span>
            </div>
            <TransitionRange min={20} max={200} step={10} value={resolution} onChange={setResolution} />
          </div>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${wireframe
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
          >
            <span>Structural Mesh</span>
            <span className="font-mono">{wireframe ? '[ ON ]' : '[ OFF ]'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
