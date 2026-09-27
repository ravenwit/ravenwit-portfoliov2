/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { PRESETS } from './constants';

export default function App() {
  const [preset, setPreset] = useState('Torus');
  const [params, setParams] = useState(PRESETS['Torus']);
  const [wireframe, setWireframe] = useState(false);
  const [resolution, setResolution] = useState(100);

  const handlePresetChange = (name: string) => {
    setPreset(name);
    setParams(PRESETS[name]);
  };

  const updateParam = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setPreset('Custom');
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar
        params={params}
        updateParam={updateParam}
        preset={preset}
        onPresetChange={handlePresetChange}
        wireframe={wireframe}
        setWireframe={setWireframe}
        resolution={resolution}
        setResolution={setResolution}
      />
      <main className="flex-1 relative h-full">
        <Scene params={params} wireframe={wireframe} resolution={resolution} />
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-zinc-950/80 backdrop-blur-md p-4 border border-zinc-700 shadow-xl max-w-sm rounded-none">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 opacity-80">Master Evaluation Matrix</h2>
            <div className="text-xs font-mono text-zinc-400 space-y-1">
              <p>x = (R + f₁cos(τu) - f₂sin(τu)) * cos(u)</p>
              <p>y = (R + f₁cos(τu) - f₂sin(τu)) * sin(u)</p>
              <p>z = f₁sin(τu) + f₂cos(τu)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

