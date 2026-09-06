// --- Pillar 04: Simulation Playground ---
// Manages the interactive computational physics laboratory and sandboxed iframes.

export const SIMULATION_EXPERIMENTS = [
    {
        id: 'qft-propagator',
        title: 'QFT Propagator',
        category: 'QUANTUM & QFT',
        desc: 'Feynman path formulation of relativistic quantum field propagators with complex phase evolution.',
        file: '/vfs/visuals/Path Integral/qft propagator.html',
        tag: 'PROPAGATOR // S-MATRIX'
    },
    {
        id: 'wick-theorem',
        title: "Wick's Contraction Theorem",
        category: 'QUANTUM & QFT',
        desc: 'Time-ordered operator contractions and Gaussian functional integrals visualized on a dynamic spacetime lattice.',
        file: '/vfs/visuals/Path Integral/1. wick theorem.html',
        tag: 'PATH INTEGRAL // WICK'
    },
    {
        id: 'feynman-paths',
        title: 'Feynman Path Lattice',
        category: 'QUANTUM & QFT',
        desc: 'Interference of infinite quantum trajectories converging to classical geodesics via stationary phase.',
        file: '/vfs/visuals/Path Integral/6. feynmann paths.html',
        tag: 'QUANTUM PATHS // LEAST ACTION'
    },
    {
        id: 'bhabha-scatter',
        title: 'Bhabha & Møller Scattering',
        category: 'QUANTUM & QFT',
        desc: 'Tree-level QED cross sections showing s-channel annihilation and t-channel exchange diagrams.',
        file: '/vfs/visuals/Path Integral/2. bhabha scater.html',
        tag: 'QED // CROSS SECTION'
    },
    {
        id: 'mobius-traverse',
        title: 'Möbius Geodesic Traverse',
        category: 'TOPOLOGY',
        desc: 'Non-orientable manifold coordinate flow with twist identification and intrinsic metric tensor curvature.',
        file: '/vfs/visuals/Spin Topology/mobius topology traverese.html',
        tag: 'TOPOLOGY // CHIRALITY'
    },
    {
        id: 'torus-traverse',
        title: 'Torus Surface Metric',
        category: 'TOPOLOGY',
        desc: 'Periodic Clifford torus projection with toroidal & poloidal magnetic winding numbers.',
        file: '/vfs/visuals/Spin Topology/torus topology traverese.html',
        tag: 'TOPOLOGY // TOROID'
    },
    {
        id: 'anyons-topology',
        title: 'Fractional Anyon Braid Statistics',
        category: 'TOPOLOGY',
        desc: '2+1D topological braiding phases intermediate between bosons and fermions with Berry phase accumulation.',
        file: '/vfs/visuals/Anyons/anyons topology.html',
        tag: 'BRAID GROUP // FRACTIONAL'
    },
    {
        id: 'background-strings',
        title: '3D Cosserat String Dynamics',
        category: 'TOPOLOGY',
        desc: 'Continuous elastic Cosserat rod filaments vibrating in turbulent background hydrodynamic flows.',
        file: '/vfs/visuals/Spin Topology/background strings 3d.html',
        tag: 'STRINGS // COSSERAT'
    },
    {
        id: 'riemann-conformal',
        title: 'Riemann Sphere Stereographic Projection',
        category: 'COMPLEX ANALYSIS',
        desc: 'Conformal mapping from the complex plane C onto S2 preserving local orthogonality.',
        file: '/vfs/visuals/Singularity/reimann sphere conformal.html',
        tag: 'CONFORMAL // RIEMANN S2'
    },
    {
        id: 'analytic-continuation',
        title: 'Analytic Continuation Singularities',
        category: 'COMPLEX ANALYSIS',
        desc: 'Branch cuts, poles, and monodromy around essential singularities across overlapping Riemann surfaces.',
        file: '/vfs/visuals/Singularity/analytic continuation conformal.html',
        tag: 'MONODROMY // BRANCH CUT'
    },
    {
        id: 'homotopy-singularity',
        title: 'Topological Homotopy & Singularity',
        category: 'COMPLEX ANALYSIS',
        desc: 'Continuous homotopy deformation of closed loops enclosing isolated topological defects.',
        file: '/vfs/visuals/Singularity/homotopy and singularity.html',
        tag: 'FUNDAMENTAL GROUP // PI_1'
    },
    {
        id: 'zeta-flow',
        title: 'Riemann Zeta Flow & Critical Line',
        category: 'FLOW & HARMONICS',
        desc: 'Gradient vector field of zeta(s) near non-trivial zeros on the critical strip Re(s) = 1/2.',
        file: '/vfs/visuals/Zeta/zeta fourier and flow.html',
        tag: 'ANALYTIC NUMBER THEORY'
    },
    {
        id: 'fourier-harmonics',
        title: 'Epicyclic Fourier Decomposition',
        category: 'FLOW & HARMONICS',
        desc: 'Harmonic decomposition of parametric geometric curves into rotating complex orbital phasors.',
        file: '/vfs/visuals/fourier.html',
        tag: 'FOURIER SERIES // PHASORS'
    },
    {
        id: 'wavelet-cnn',
        title: 'Wavelet Transform on Toroidal Manifold',
        category: 'FLOW & HARMONICS',
        desc: 'Continuous Morlet wavelet spatial decomposition applied directly across curved Riemannian coordinates.',
        file: '/vfs/visuals/wavelet cnn torus.html',
        tag: 'WAVELET // RIEMANNIAN'
    }
];

let activeCategory = 'ALL';

export function initPlayground() {
    renderPlaygroundGrid();
    setupPlaygroundListeners();
}

function renderPlaygroundGrid() {
    const gridEl = document.getElementById('playground-bento-grid');
    if (!gridEl) return;

    const filtered = activeCategory === 'ALL' 
        ? SIMULATION_EXPERIMENTS 
        : SIMULATION_EXPERIMENTS.filter(exp => exp.category === activeCategory);

    gridEl.innerHTML = filtered.map((exp, idx) => `
        <div class="playground-card" data-sim-id="${exp.id}" data-sim-file="${exp.file}">
            <div class="playground-card-meta">
                <span class="playground-card-tag">${exp.tag}</span>
                <span class="playground-card-idx">EXP-${String(idx + 1).padStart(2, '0')}</span>
            </div>
            <h3 class="playground-card-title">${exp.title}</h3>
            <p class="playground-card-desc">${exp.desc}</p>
            <div class="playground-card-footer">
                <span class="playground-category-pill">${exp.category}</span>
                <button class="playground-launch-btn" data-file="${exp.file}" data-title="${exp.title}" aria-label="Launch ${exp.title}">
                    <span>RUN EXPERIMENT</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
            </div>
        </div>
    `).join('');

    // Trigger MathJax typeset on formulas if present
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([gridEl]).catch(() => {});
    }

    // Attach click listeners to cards and launch buttons
    gridEl.querySelectorAll('.playground-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const file = card.dataset.simFile;
            const title = card.querySelector('.playground-card-title')?.textContent || 'Simulation';
            openSimulationModal(file, title);
        });
    });
}

function setupPlaygroundListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.playground-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category || 'ALL';
            renderPlaygroundGrid();
        });
    });

    // Modal Close
    const closeBtn = document.getElementById('playground-modal-close');
    const modal = document.getElementById('playground-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', closeSimulationModal);
    }

    // Fullscreen Toggle
    const fsBtn = document.getElementById('playground-modal-fullscreen');
    if (fsBtn && modal) {
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                modal.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.().catch(() => {});
            }
        });
    }

    // Reload Button
    const reloadBtn = document.getElementById('playground-modal-reload');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            const iframe = document.getElementById('playground-iframe');
            if (iframe && iframe.src) {
                iframe.src = iframe.src;
            }
        });
    }

    // ESC key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSimulationModal();
        }
    });
}

export function openSimulationModal(fileUrl, title) {
    const modal = document.getElementById('playground-modal');
    const iframe = document.getElementById('playground-iframe');
    const titleEl = document.getElementById('playground-modal-title');
    if (!modal || !iframe) return;

    if (titleEl) titleEl.textContent = title;
    iframe.src = fileUrl;
    modal.classList.add('active');
}

export function closeSimulationModal() {
    const modal = document.getElementById('playground-modal');
    const iframe = document.getElementById('playground-iframe');
    if (!modal) return;

    modal.classList.remove('active');
    if (iframe) iframe.src = 'about:blank';
}
