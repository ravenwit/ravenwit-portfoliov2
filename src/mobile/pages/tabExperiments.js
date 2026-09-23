// ==========================================================================
// Spacetime Portfolio — Mobile Page: Experiments & Lab (Tab 05)
// Interactive simulations: qucontext (Quantum Contextuality) + visualizers
// ==========================================================================

import { SIMULATION_EXPERIMENTS } from '../../components/playgroundSection.js';

let activeSimUrl = null;
let activeSimTitle = '';

export function renderTabExperiments(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-experiments-container">
            <!-- Header -->
            <div class="mobile-experiments-header">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[05]</span>
                    <h1 class="mobile-section-heading">SIMULATION EXPERIMENTS</h1>
                </div>
            </div>

            <!-- Spotlight Feature: qucontext -->
            <div class="mobile-spotlight-card">
                <div class="spotlight-top-badge">
                    <span class="chrono-pulse-dot"></span>
                    <span>FLAGSHIP EXPERIMENT // QUANTUM LAB</span>
                </div>
                <h2 class="spotlight-title">qucontext: Quantum Contextuality Lab</h2>
                <div class="spotlight-tags">
                    <span class="spotlight-tag">KCBS PENTAGRAM</span>
                    <span class="spotlight-tag">TSIRELSON BOUND</span>
                    <span class="spotlight-tag">CORRELATION POLYTOPES</span>
                </div>
                <p class="spotlight-desc">
                    Rigorous interactive computational laboratory testing the mathematical boundary between classical local realism, quantum state contextual correlations, and hypothetical super-quantum PR boxes.
                </p>

                <div class="spotlight-preview-wrap">
                    <div class="qucontext-schematic">
                        <div class="polytope-pentagon">
                            <span class="pentagon-node n1"></span>
                            <span class="pentagon-node n2"></span>
                            <span class="pentagon-node n3"></span>
                            <span class="pentagon-node n4"></span>
                            <span class="pentagon-node n5"></span>
                        </div>
                        <div class="pentagon-label">KCBS BOUND: √5 ≈ 2.236</div>
                    </div>
                </div>

                <button class="mobile-action-btn primary full-width" id="btn-launch-qucontext" aria-label="Launch qucontext experiment">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>LAUNCH QUCONTEXT LAB</span>
                </button>
            </div>

            <!-- Interactive Simulations Grid -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[05.1]</span>
                    <h2 class="mobile-section-heading">VISUAL PHYSICS EXPERIMENTS</h2>
                </div>

                <div class="mobile-sim-grid" id="mobile-sim-grid">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    `;

    // Ensure body-mounted modal exists
    let modalEl = document.getElementById('mobile-sim-modal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'mobile-sim-modal';
        modalEl.className = 'mobile-sim-modal';
        modalEl.style.display = 'none';
        modalEl.innerHTML = `
            <div class="sim-modal-header">
                <div class="sim-modal-title-wrap">
                    <span class="chrono-pulse-dot"></span>
                    <span class="sim-modal-title" id="sim-modal-title">RUNNING EXPERIMENT</span>
                </div>
                <button class="mobile-drawer-close-btn" id="btn-exit-sim" aria-label="Exit simulation">✕ EXIT</button>
            </div>
            <div class="sim-modal-body">
                <iframe id="sim-modal-iframe" class="sim-modal-iframe" src="" allow="accelerometer; autoplay; encrypted-media; gyroscope;" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
            </div>
        `;
        document.body.appendChild(modalEl);
    }

    // Populate simulations grid (skipping qucontext since it has hero spotlight)
    const gridEl = container.querySelector('#mobile-sim-grid');
    if (gridEl) {
        const otherSims = SIMULATION_EXPERIMENTS.filter(s => s.id !== 'qucontext');
        let html = '';
        otherSims.forEach((sim, idx) => {
            html += `
                <div class="mobile-sim-card" data-idx="${idx}">
                    <div class="sim-card-top">
                        <span class="sim-card-cat">${sim.category || 'QUANTUM & QFT'}</span>
                        ${sim.tag ? `<span class="sim-card-tag">${sim.tag}</span>` : ''}
                    </div>
                    <h3 class="sim-card-title">${sim.title}</h3>
                    <p class="sim-card-desc">${sim.desc}</p>
                    <button class="mobile-action-btn secondary sim-launch-btn" data-url="${sim.file}" data-title="${sim.title}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span>LAUNCH EXPERIMENT</span>
                    </button>
                </div>
            `;
        });
        gridEl.innerHTML = html;
    }

    const iframeEl = modalEl.querySelector('#sim-modal-iframe');
    const titleEl = modalEl.querySelector('#sim-modal-title');
    const exitBtn = modalEl.querySelector('#btn-exit-sim');

    const openSimulation = (url, title) => {
        if (!modalEl || !iframeEl) return;
        activeSimUrl = url;
        activeSimTitle = title;
        if (titleEl) titleEl.innerText = title;
        iframeEl.src = url;
        modalEl.style.display = 'flex';
    };

    const closeSimulation = () => {
        if (!modalEl || !iframeEl) return;
        modalEl.style.display = 'none';
        iframeEl.src = '';
        activeSimUrl = null;
    };

    // Hook qucontext launch
    const btnQucontext = container.querySelector('#btn-launch-qucontext');
    if (btnQucontext) {
        btnQucontext.onclick = () => {
            openSimulation('/qucontext', 'qucontext: Quantum Contextuality Lab');
        };
    }

    // Hook grid launch buttons
    const launchBtns = container.querySelectorAll('.sim-launch-btn');
    launchBtns.forEach(btn => {
        btn.onclick = () => {
            const url = btn.getAttribute('data-url');
            const title = btn.getAttribute('data-title');
            if (url) openSimulation(url, title);
        };
    });

    if (exitBtn) {
        exitBtn.onclick = closeSimulation;
    }
}
