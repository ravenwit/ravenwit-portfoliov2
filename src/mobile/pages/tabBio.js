// ==========================================================================
// Spacetime Portfolio — Mobile Page: Home & Quantum Identity (Tab 01)
// Creative & Sleek: Interactive Wavefunction Field, Living Research Vectors & Official Logo
// ==========================================================================

import { triggerHaptic } from '../chronoDial.js';

let homeAnimId = null;
let homeCanvas = null;
let homeCtx = null;
let wavePerturbations = [];

// Micro-visualizer state for research vectors
let qecPlaquettes = [
    { type: 'X', active: false, x: 0, y: 0 },
    { type: 'Z', active: false, x: 1, y: 0 },
    { type: 'X', active: false, x: 0, y: 1 },
    { type: 'Z', active: true,  x: 1, y: 1 }
];

export function renderTabBio(container, onNavigateTab) {
    // Teardown previous loops
    if (homeAnimId) {
        cancelAnimationFrame(homeAnimId);
        homeAnimId = null;
    }

    container.innerHTML = `
        <div class="mobile-home-container">
            <!-- Living Quantum Wavefunction Interference Canvas Hero -->
            <div class="home-quantum-hero-card">
                <div class="home-canvas-wrap">
                    <canvas id="home-quantum-canvas" width="340" height="130" class="interactive-touch-zone"></canvas>
                    <div class="home-canvas-overlay">
                        <span class="home-canvas-tag">⟨ψ|ψ⟩ PROBABILITY DENSITY</span>
                        <span class="home-canvas-hint">TOUCH TO INJECT WAVEPACKET</span>
                    </div>
                </div>

                <!-- Hero Identity & Official Monogram -->
                <div class="home-identity-block">
                    <div class="home-avatar-container">
                        <div class="home-avatar-ring"></div>
                        <div class="home-avatar-disc">
                            <img src="/icons/logo.svg" alt="Ravenwit Geometric Logo" class="home-avatar-logo" />
                        </div>
                    </div>

                    <div class="home-hero-text">
                        <div class="home-status-row">
                            <span class="chrono-pulse-dot"></span>
                            <span class="home-status-badge">RESEARCH ACTIVE · COLOGNE [DE]</span>
                        </div>
                        <h1 class="home-hero-title">SHAKIR AHMED</h1>
                        <div class="home-hero-alias">known as <strong>ravenwit</strong></div>
                        <div class="home-hero-subtitle">Theoretical Physics & Computational Architect</div>
                        <div class="home-hero-institution">MSc Physics Candidate · University of Cologne</div>
                    </div>
                </div>

                <!-- Primary Action Buttons -->
                <div class="home-action-row">
                    <a href="/Shakir_Ahmed_CV.pdf" target="_blank" rel="noopener" class="mobile-action-btn primary" aria-label="Download Shakir Ahmed CV">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>DOWNLOAD CV</span>
                    </a>
                    <a href="mailto:shakir@ravenwit.com" class="mobile-action-btn secondary" aria-label="Email Shakir Ahmed">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>CONTACT</span>
                    </a>
                </div>

                <!-- Social Connectors -->
                <div class="home-social-chips">
                    <a href="https://github.com/ravenwit" target="_blank" rel="noopener" class="home-chip" aria-label="GitHub Profile">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        <span>GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/shakir-ahmed-raven" target="_blank" rel="noopener" class="home-chip" aria-label="LinkedIn Profile">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        <span>LinkedIn</span>
                    </a>
                    <a href="https://www.researchgate.net/profile/Shakir-Ahmed-5" target="_blank" rel="noopener" class="home-chip" aria-label="ResearchGate Profile">
                        <span style="font-weight: 800; font-size: 10px;">RG</span>
                        <span>ResearchGate</span>
                    </a>
                    <a href="https://twitter.com/shakir7733" target="_blank" rel="noopener" class="home-chip" aria-label="Twitter Profile">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                        <span>Twitter/X</span>
                    </a>
                </div>
            </div>

            <!-- Narrative Abstract -->
            <div class="home-section-block">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[01.1]</span>
                    <h2 class="mobile-section-heading">PARADIGM & NARRATIVE</h2>
                </div>
                <div class="home-narrative-card">
                    <p class="narrative-lead">
                        Bridging theoretical mathematical physics with high-performance computational architectures, from category-theoretic tensor networks to non-linear neural operators.
                    </p>
                    <p>
                        Writing code since age 13, I evolved from bare-metal systems and server infrastructure into quantum many-body physics, topological matter, and geometric deep learning.
                    </p>
                </div>
            </div>

            <!-- Living Interactive Research Vectors -->
            <div class="home-section-block">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[01.2]</span>
                    <h2 class="mobile-section-heading">LIVING RESEARCH VECTORS</h2>
                </div>
                
                <div class="home-vectors-stack">
                    <!-- Vector 01: Quantum Error Correction -->
                    <div class="home-vector-card" id="vector-qec">
                        <div class="vector-header">
                            <span class="vector-badge">QUANTUM INFO</span>
                            <span class="vector-metric">SURFACE CODES</span>
                        </div>
                        <h3 class="vector-title">Quantum Error Correction & Many-Body Physics</h3>
                        <p class="vector-desc">Simulating fault-tolerant topological stabilizer codes, toric lattice phases, and tensor network contraction.</p>
                        
                        <!-- Interactive Surface Code Plaquette Mini-Visualizer -->
                        <div class="qec-mini-lattice" id="qec-mini-lattice">
                            <div class="qec-plaquette x-stab" data-idx="0"><span>X₁</span></div>
                            <div class="qec-plaquette z-stab" data-idx="1"><span>Z₁</span></div>
                            <div class="qec-plaquette z-stab" data-idx="2"><span>Z₂</span></div>
                            <div class="qec-plaquette x-stab active" data-idx="3"><span>X₂</span></div>
                        </div>
                        <div class="vector-interactive-hint">TAP PLAQUETTE TO DETECT SYNDROME FLIP</div>
                    </div>

                    <!-- Vector 02: Geometric Deep Learning -->
                    <div class="home-vector-card">
                        <div class="vector-header">
                            <span class="vector-badge">AI / ML</span>
                            <span class="vector-metric">340× SPEEDUP</span>
                        </div>
                        <h3 class="vector-title">Geometric Deep Learning & Fourier Operators</h3>
                        <p class="vector-desc">Fourier Neural Operators predicting non-linear Navier-Stokes turbulence on curved manifold geometry with zero-shot resolution.</p>
                        <div class="vector-telemetry-row">
                            <span class="vec-tel-item">Modes: <strong>k ≤ 32</strong></span>
                            <span class="vec-tel-item">Rel L2: <strong>&lt; 1.18%</strong></span>
                            <span class="vec-tel-item">Inference: <strong>4.1 ms</strong></span>
                        </div>
                    </div>

                    <!-- Vector 03: Statistical Mechanics -->
                    <div class="home-vector-card">
                        <div class="vector-header">
                            <span class="vector-badge">STAT MECH</span>
                            <span class="vector-metric">Tc ≈ 2.269</span>
                        </div>
                        <h3 class="vector-title">Metropolis Phase Transitions & Hamiltonian Inference</h3>
                        <p class="vector-desc">Monte Carlo Markov chain simulation of spontaneous symmetry breaking and inverse generative coupling estimation.</p>
                        <div class="vector-telemetry-row">
                            <span class="vec-tel-item">Lattice: <strong>32×32</strong></span>
                            <span class="vec-tel-item">State: <strong>Onsager Critical</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fast Exploration Portals -->
            <div class="home-section-block">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[01.3]</span>
                    <h2 class="mobile-section-heading">EXPLORATION PORTALS</h2>
                </div>
                <div class="home-portals-grid">
                    <button class="home-portal-card" id="home-to-timeline">
                        <span class="portal-code">02</span>
                        <div class="portal-info">
                            <strong>TIMELINE</strong>
                            <span>Academic trajectory (2011–2026)</span>
                        </div>
                        <span class="portal-arrow">→</span>
                    </button>
                    <button class="home-portal-card" id="home-to-works">
                        <span class="portal-code">03</span>
                        <div class="portal-info">
                            <strong>WORKS & EXHIBITS</strong>
                            <span>Megh, Geo-FNO, Ising & Archive</span>
                        </div>
                        <span class="portal-arrow">→</span>
                    </button>
                    <button class="home-portal-card" id="home-to-arsenal">
                        <span class="portal-code">04</span>
                        <div class="portal-info">
                            <strong>ARSENAL</strong>
                            <span>121 Technical Skills Matrix</span>
                        </div>
                        <span class="portal-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initialize Interactive Quantum Wavefunction Canvas
    setupQuantumHeroCanvas(container);

    // Setup interactive QEC Plaquettes
    setupQECPlaquettes(container);

    // Wire fast portals
    const btnTimeline = container.querySelector('#home-to-timeline');
    const btnWorks = container.querySelector('#home-to-works');
    const btnArsenal = container.querySelector('#home-to-arsenal');

    if (btnTimeline) btnTimeline.onclick = () => onNavigateTab && onNavigateTab('TIMELINE', 1);
    if (btnWorks) btnWorks.onclick = () => onNavigateTab && onNavigateTab('WORKS', 2);
    if (btnArsenal) btnArsenal.onclick = () => onNavigateTab && onNavigateTab('ARSENAL', 3);
}

// --------------------------------------------------------------------------
// INTERACTIVE QUANTUM WAVEFUNCTION PHASE INTERFERENCE ENGINE
// --------------------------------------------------------------------------
function setupQuantumHeroCanvas(container) {
    homeCanvas = container.querySelector('#home-quantum-canvas');
    if (!homeCanvas) return;
    homeCtx = homeCanvas.getContext('2d');

    const rect = homeCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = (rect.width || 340) * dpr;
    const ch = 130 * dpr;
    homeCanvas.width = cw;
    homeCanvas.height = ch;
    homeCtx.scale(dpr, dpr);

    const w = cw / dpr;
    const h = ch / dpr;

    const nx = 42;
    const ny = 16;
    let t = 0;

    wavePerturbations = [];

    function injectPacket(clientX, clientY) {
        const cRect = homeCanvas.getBoundingClientRect();
        const normX = (clientX - cRect.left) / cRect.width;
        const normY = (clientY - cRect.top) / cRect.height;
        if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
            triggerHaptic(8);
            wavePerturbations.push({
                x: normX,
                y: normY,
                radius: 0.08,
                strength: 2.2,
                decay: 0.985
            });
            if (wavePerturbations.length > 5) wavePerturbations.shift();
        }
    }

    homeCanvas.addEventListener('pointerdown', (e) => injectPacket(e.clientX, e.clientY), { passive: true });
    homeCanvas.addEventListener('pointermove', (e) => {
        if (e.buttons > 0) injectPacket(e.clientX, e.clientY);
    }, { passive: true });

    function renderQuantumWave() {
        t += 0.04;
        homeCtx.clearRect(0, 0, w, h);

        const cellW = w / nx;
        const cellH = h / ny;

        // Attenuate dynamic wavepacket perturbations
        for (let p = wavePerturbations.length - 1; p >= 0; p--) {
            const pert = wavePerturbations[p];
            pert.strength *= pert.decay;
            pert.radius += 0.015;
            if (pert.strength < 0.04) wavePerturbations.splice(p, 1);
        }

        // Render 2D quantum phase amplitude field
        for (let j = 0; j < ny; j++) {
            const yN = j / ny;
            for (let i = 0; i < nx; i++) {
                const xN = i / nx;

                // Complex amplitude superposition: psi = Re + i*Im
                let re = Math.cos(2.5 * Math.PI * xN - t * 1.4) * Math.sin(2.0 * Math.PI * yN);
                let im = Math.sin(2.5 * Math.PI * xN - t * 1.4) * Math.cos(2.0 * Math.PI * yN);

                // Add secondary eigenmode harmonic
                re += 0.6 * Math.cos(4.2 * Math.PI * xN + t * 0.9) * Math.cos(3.2 * Math.PI * yN - t * 0.6);
                im += 0.6 * Math.sin(4.2 * Math.PI * xN + t * 0.9) * Math.sin(3.2 * Math.PI * yN - t * 0.6);

                // Add dynamic perturbations
                wavePerturbations.forEach(pert => {
                    const dx = xN - pert.x;
                    const dy = yN - pert.y;
                    const dist = Math.hypot(dx, dy);
                    const ripple = Math.sin(dist * 24 - t * 4) * Math.exp(-dist * dist / (2 * pert.radius * pert.radius));
                    re += pert.strength * ripple;
                    im += pert.strength * ripple * 0.8;
                });

                // Probability density P = |psi|^2
                const prob = Math.min((re * re + im * im) * 0.35, 1.0);
                const phase = Math.atan2(im, re); // [-pi, pi]

                const px = i * cellW;
                const py = j * cellH;

                // Colorize by phase angle & prob density
                if (phase > 0.5) {
                    homeCtx.fillStyle = `rgba(111, 220, 247, ${prob * 0.8})`; // Cyan
                } else if (phase < -0.5) {
                    homeCtx.fillStyle = `rgba(232, 180, 92, ${prob * 0.75})`; // Gold
                } else {
                    homeCtx.fillStyle = `rgba(67, 105, 238, ${prob * 0.65})`; // Royal blue
                }

                homeCtx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
            }
        }

        // Draw quantum phase contour filaments
        homeCtx.beginPath();
        for (let k = 0; k < 3; k++) {
            const trackY = (h * 0.25) + (k * h * 0.25);
            homeCtx.moveTo(0, trackY);
            for (let x = 0; x < w; x += 10) {
                const xN = x / w;
                const amp = Math.sin(xN * 8 + t * 1.2 + k) * 5;
                homeCtx.lineTo(x, trackY + amp);
            }
        }
        homeCtx.strokeStyle = 'rgba(236, 231, 219, 0.12)';
        homeCtx.lineWidth = 1;
        homeCtx.stroke();

        homeAnimId = requestAnimationFrame(renderQuantumWave);
    }

    homeAnimId = requestAnimationFrame(renderQuantumWave);
}

// --------------------------------------------------------------------------
// INTERACTIVE QUANTUM ERROR CORRECTION (QEC) MINI-LATTICE
// --------------------------------------------------------------------------
function setupQECPlaquettes(container) {
    const plaquettes = container.querySelectorAll('.qec-plaquette');
    plaquettes.forEach((plaq, idx) => {
        plaq.addEventListener('click', () => {
            triggerHaptic(12);
            plaq.classList.toggle('active');
            const isActive = plaq.classList.contains('active');
            const type = qecPlaquettes[idx].type;
            const hint = container.querySelector('.vector-interactive-hint');
            if (hint) {
                hint.innerText = isActive 
                    ? `SYNDROME DETECTED ON ${type}-STABILIZER [PULSE LOGGED]`
                    : `SYNDROME RESOLVED — GROUND STATE RESTORED`;
            }
        });
    });
}
