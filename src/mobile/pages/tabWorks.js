// ==========================================================================
// Spacetime Portfolio — Mobile Page: Works & Highlights (Tab 03)
// 3 Living Interactive Exhibits (Megh, Geo-FNO, Ising) + Quantum Archive
// ==========================================================================

let activeHighlight = 0; // 0: Megh, 1: Geo-FNO, 2: Ising
let archiveOpen = false;
let researchData = [];
let archiveFilter = 'ALL';
let archiveSearchQuery = '';

// Exhibit 01 (Megh) Animation State
let meghCanvas = null;
let meghCtx = null;
let meghAnimId = null;
let meghSelectedProvider = null;

// Exhibit 02 (Geo-FNO) Spectral Vorticity State
let geofnoCanvas = null;
let geofnoCtx = null;
let geofnoAnimId = null;
let geofnoKMax = 32;
let geofnoVortices = [];

// Exhibit 03 (Ising) Simulation State
let isingCanvas = null;
let isingCtx = null;
let isingGrid = null;
let isingL = 32;
let isingTemp = 2.269;
let isingRunning = false;
let isingAnimId = null;

export async function renderTabWorks(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-works-container">
            <!-- Header -->
            <div class="mobile-works-header">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[03]</span>
                    <h1 class="mobile-section-heading">WORKS & EXHIBITS</h1>
                </div>
                
                <!-- High-Contrast Segmented Capsule Switcher -->
                <div class="mobile-highlight-nav">
                    <button class="mobile-hl-btn ${activeHighlight === 0 ? 'active' : ''}" data-hl="0" aria-label="Exhibit 01 Megh">
                        <span class="hl-pill-code">01</span>
                        <span class="hl-pill-label">MEGH</span>
                    </button>
                    <button class="mobile-hl-btn ${activeHighlight === 1 ? 'active' : ''}" data-hl="1" aria-label="Exhibit 02 Geo-FNO">
                        <span class="hl-pill-code">02</span>
                        <span class="hl-pill-label">GEO-FNO</span>
                    </button>
                    <button class="mobile-hl-btn ${activeHighlight === 2 ? 'active' : ''}" data-hl="2" aria-label="Exhibit 03 Ising">
                        <span class="hl-pill-code">03</span>
                        <span class="hl-pill-label">ISING</span>
                    </button>
                </div>
            </div>

            <!-- Active Highlight Display Stage -->
            <div class="mobile-highlight-stage" id="mobile-highlight-stage">
                <!-- Dynamically rendered highlight card -->
            </div>

            <!-- Prominent Archive CTA -->
            <div class="mobile-archive-cta-banner">
                <div class="archive-banner-info">
                    <span class="archive-banner-tag">ARCHIVE</span>
                    <h3 class="archive-banner-title">RESEARCH PAPERS & PROJECTS</h3>
                    <p class="archive-banner-sub">18+ theoretical derivations, Monte Carlo simulators & open-source software</p>
                </div>
                <button class="mobile-action-btn primary full-width" id="btn-open-archive" aria-label="Open Projects and Research Archive">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>EXPLORE ALL PROJECTS & PAPERS</span>
                </button>
            </div>
        </div>
    `;

    renderHighlightCard(container);

    // Setup or retrieve body-mounted Archive Drawer
    let drawerEl = document.getElementById('mobile-archive-drawer');
    if (!drawerEl) {
        drawerEl = document.createElement('div');
        drawerEl.id = 'mobile-archive-drawer';
        drawerEl.className = 'mobile-archive-drawer';
        drawerEl.style.display = 'none';
        drawerEl.innerHTML = `
            <div class="archive-drawer-header">
                <div class="archive-drawer-title-wrap">
                    <span class="chrono-pulse-dot"></span>
                    <h2 class="archive-drawer-title">PROJECTS & RESEARCH ARCHIVE</h2>
                    <span class="archive-drawer-count" id="archive-count">[18 ITEMS]</span>
                </div>
                <button class="mobile-drawer-close-btn" id="btn-close-archive" aria-label="Close Archive View">✕ CLOSE</button>
            </div>

            <div class="archive-drawer-controls">
                <div class="mobile-search-row">
                    <input type="text" id="archive-search-input" class="mobile-search-input" placeholder="Search papers, math, tags..." aria-label="Search archive" />
                </div>
                <div class="mobile-filter-chips scrollable" id="archive-category-chips">
                    <button class="mobile-chip ${archiveFilter === 'ALL' ? 'active' : ''}" data-cat="ALL">ALL</button>
                    <button class="mobile-chip ${archiveFilter === 'THEORY' ? 'active' : ''}" data-cat="THEORY">THEORY</button>
                    <button class="mobile-chip ${archiveFilter === 'COMPUTATIONAL' ? 'active' : ''}" data-cat="COMPUTATIONAL">COMPUTATIONAL</button>
                    <button class="mobile-chip ${archiveFilter === 'ML_AI' ? 'active' : ''}" data-cat="ML_AI">AI/ML</button>
                    <button class="mobile-chip ${archiveFilter === 'DEVOPS' ? 'active' : ''}" data-cat="DEVOPS">DEVOPS</button>
                    <button class="mobile-chip ${archiveFilter === 'DESIGN' ? 'active' : ''}" data-cat="DESIGN">DESIGN</button>
                </div>
            </div>

            <div class="archive-drawer-list" id="archive-drawer-list">
                <div class="mobile-loading-skeleton">Loading Research Publications...</div>
            </div>
        `;
        document.body.appendChild(drawerEl);
    }

    // Setup Highlight Switcher
    const hlBtns = container.querySelectorAll('.mobile-hl-btn');
    hlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hlBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeHighlight = parseInt(btn.getAttribute('data-hl'), 10);
            renderHighlightCard(container);
        });
    });

    // Setup Archive Modal
    const btnOpenArchive = container.querySelector('#btn-open-archive');
    const btnCloseArchive = drawerEl.querySelector('#btn-close-archive');

    if (btnOpenArchive && drawerEl) {
        btnOpenArchive.addEventListener('click', () => {
            archiveOpen = true;
            drawerEl.style.display = 'flex';
            loadAndRenderArchive(drawerEl);
        });
    }

    if (btnCloseArchive && drawerEl) {
        btnCloseArchive.addEventListener('click', () => {
            archiveOpen = false;
            drawerEl.style.display = 'none';
        });
    }
}

function stopAllExhibitLoops() {
    if (meghAnimId) {
        cancelAnimationFrame(meghAnimId);
        meghAnimId = null;
    }
    if (geofnoAnimId) {
        cancelAnimationFrame(geofnoAnimId);
        geofnoAnimId = null;
    }
    if (isingAnimId) {
        cancelAnimationFrame(isingAnimId);
        isingAnimId = null;
    }
    isingRunning = false;
}

function renderHighlightCard(container) {
    const stage = container.querySelector('#mobile-highlight-stage');
    if (!stage) return;

    stopAllExhibitLoops();

    if (activeHighlight === 0) {
        // ==================================================================
        // EXHIBIT 01: MEGH ENCRYPTED MULTI-CLOUD STORAGE VAULT
        // ==================================================================
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 01 / 03</span>
                    <span class="hl-tag">CLOUD SYSTEMS & CRYPTOGRAPHY</span>
                </div>
                <h2 class="hl-title">MEGH // ENCRYPTED CLOUD VAULT</h2>
                <p class="hl-desc">
                    Client-side encrypted zero-knowledge storage vault aggregating free tiers across Google Drive, Dropbox, Backblaze B2, MEGA, and OneDrive into a unified 52 GB virtual storage pool.
                </p>

                <!-- Interactive Cryptographic Orbital Visualizer -->
                <div class="hl-preview-box megh-visual-box">
                    <div class="megh-canvas-wrap">
                        <canvas id="megh-vault-canvas" width="320" height="150" class="interactive-touch-zone"></canvas>
                        <div class="megh-vault-badge">
                            <span class="vault-status-indicator">● AES-256-GCM ACTIVE</span>
                            <span class="vault-sum-text" id="megh-capacity-display">52 GB UNIFIED POOL</span>
                        </div>
                    </div>

                    <!-- 5 Provider Shard Chips -->
                    <div class="megh-provider-pill-grid" id="megh-chips-grid">
                        <button class="megh-provider-chip gdrive" data-provider="gdrive" data-gb="15">GDrive · 15GB</button>
                        <button class="megh-provider-chip dropbox" data-provider="dropbox" data-gb="2">Dropbox · 2GB</button>
                        <button class="megh-provider-chip b2" data-provider="b2" data-gb="10">Backblaze · 10GB</button>
                        <button class="megh-provider-chip mega" data-provider="mega" data-gb="20">MEGA · 20GB</button>
                        <button class="megh-provider-chip onedrive" data-provider="onedrive" data-gb="5">OneDrive · 5GB</button>
                    </div>
                </div>

                <div class="hl-specs-grid">
                    <div class="hl-spec-item">
                        <span class="spec-label">ENCRYPTION</span>
                        <span class="spec-val">Client-Side AES-256-GCM</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">UNIFIED CAPACITY</span>
                        <span class="spec-val">52 GB Free Pool (15+2+10+20+5)</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">SHARDING</span>
                        <span class="spec-val">Dynamic Chunk Redundancy</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">STORAGE PROVIDERS</span>
                        <span class="spec-val">5 Multi-Cloud Free Tiers</span>
                    </div>
                </div>

                <div class="hl-action-row">
                    <a href="https://megh-vault.vercel.app" target="_blank" rel="noopener" class="mobile-action-btn primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>LAUNCH MEGH VAULT</span>
                    </a>
                </div>
            </div>
        `;
        setupMeghVaultVisualizer(stage);

    } else if (activeHighlight === 1) {
        // ==================================================================
        // EXHIBIT 02: GEO-FNO // 2D FOURIER SPECTRAL OPERATOR
        // (Approved clean 2D spectral & vorticity canvas replacing the 3D globe)
        // ==================================================================
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 02 / 03</span>
                    <span class="hl-tag">PDE NEURAL OPERATOR</span>
                </div>
                <h2 class="hl-title">GEO-FNO // FOURIER NEURAL OPERATOR</h2>
                <p class="hl-desc">
                    Geometric Fourier Neural Operator mapping non-linear 2D Navier-Stokes fluid vorticity across mesh discretizations with continuous operator learning and zero-shot super-resolution.
                </p>

                <!-- Interactive 2D Spectral Vorticity Canvas -->
                <div class="hl-preview-box geofno-visual-box">
                    <div class="geofno-canvas-wrap">
                        <canvas id="geofno-vorticity-canvas" width="320" height="150" class="interactive-touch-zone"></canvas>
                        <div class="geofno-hint-overlay">
                            <span>TOUCH & DRAG TO INJECT SHEAR VORTEX</span>
                        </div>
                    </div>

                    <!-- Fourier Mode Cutoff Controls -->
                    <div class="geofno-mode-bar">
                        <span class="mode-bar-label">FOURIER MODES:</span>
                        <div class="geofno-mode-pills" id="geofno-mode-pills">
                            <button class="mode-pill ${geofnoKMax === 4 ? 'active' : ''}" data-k="4">k=4</button>
                            <button class="mode-pill ${geofnoKMax === 8 ? 'active' : ''}" data-k="8">k=8</button>
                            <button class="mode-pill ${geofnoKMax === 16 ? 'active' : ''}" data-k="16">k=16</button>
                            <button class="mode-pill ${geofnoKMax === 32 ? 'active' : ''}" data-k="32">k=32 (FULL)</button>
                        </div>
                    </div>
                </div>

                <!-- High-Tech Benchmark Bento Grid -->
                <div class="hl-specs-grid">
                    <div class="hl-spec-item">
                        <span class="spec-label">ACCELERATION</span>
                        <span class="spec-val">340× Over Runge-Kutta</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">INFERENCE TIME</span>
                        <span class="spec-val">4.1 ms vs 1420 ms Solver</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">RELATIVE L2 ERROR</span>
                        <span class="spec-val">&lt; 1.18% Relative L2</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">MESH INVARIANCE</span>
                        <span class="spec-val">Zero-Shot Super-Resolution</span>
                    </div>
                </div>

                <div class="hl-action-row">
                    <a href="https://github.com/ravenwit/NOMAD" target="_blank" rel="noopener" class="mobile-action-btn primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>VIEW OPERATOR CODE (NOMAD)</span>
                    </a>
                </div>
            </div>
        `;
        setupGeoFNOVisualizer(stage);

    } else if (activeHighlight === 2) {
        // ==================================================================
        // EXHIBIT 03: 2D ISING // METROPOLIS MONTE CARLO DYNAMICS
        // ==================================================================
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 03 / 03</span>
                    <span class="hl-tag">STATISTICAL MECHANICS</span>
                </div>
                <h2 class="hl-title">2D ISING // METROPOLIS DYNAMICS</h2>
                <p class="hl-desc">
                    Metropolis-Hastings Monte Carlo simulation of spontaneous symmetry breaking and 2nd-order ferromagnetic phase transitions at Onsager critical temperature <em>T_c ≈ 2.269</em>.
                </p>

                <!-- Live Mini Lattice Canvas with Direct Touch Excitation -->
                <div class="hl-ising-interactive">
                    <div class="ising-canvas-wrap">
                        <canvas id="mobile-ising-canvas" width="128" height="128" class="interactive-touch-zone"></canvas>
                        <div class="ising-telemetry-overlay">
                            <span>T: <strong id="ising-temp-display">2.27</strong></span>
                            <span>M: <strong id="ising-mag-display">+0.82</strong></span>
                        </div>
                    </div>
                    <div class="ising-touch-hint">TOUCH & DRAG ACROSS LATTICE TO EXCITE LOCAL SPINS</div>
                    <div class="ising-controls-row">
                        <div class="ising-slider-group">
                            <label for="ising-temp-slider">TEMPERATURE (T):</label>
                            <input type="range" id="ising-temp-slider" min="0.5" max="5.0" step="0.05" value="2.27" />
                        </div>
                        <button class="mobile-action-btn secondary ising-btn" id="ising-toggle-btn">
                            <span id="ising-play-icon">▶</span> <span id="ising-play-label">RUN</span>
                        </button>
                    </div>
                </div>

                <div class="hl-specs-grid">
                    <div class="hl-spec-item">
                        <span class="spec-label">LATTICE SIZE</span>
                        <span class="spec-val">32 × 32 Periodic Boundary</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">CRITICAL TEMP</span>
                        <span class="spec-val">T_c = 2/ln(1+√2) ≈ 2.269</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">HAMILTONIAN</span>
                        <span class="spec-val">H = -J ∑ ⟨i,j⟩ s_i s_j</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">ALGORITHM</span>
                        <span class="spec-val">Metropolis Acceptance Ratio</span>
                    </div>
                </div>

                <div class="hl-action-row">
                    <a href="https://github.com/ravenwit/Numerical/blob/master/IsingModel.py" target="_blank" rel="noopener" class="mobile-action-btn primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>VIEW PYTHON NUMERICAL CODE</span>
                    </a>
                </div>
            </div>
        `;
        setupIsingSimulation(stage);
    }
}

// --------------------------------------------------------------------------
// EXHIBIT 01: MEGH CRYPTOGRAPHIC ORBITAL ENGINE
// --------------------------------------------------------------------------
function setupMeghVaultVisualizer(stage) {
    meghCanvas = stage.querySelector('#megh-vault-canvas');
    if (!meghCanvas) return;
    meghCtx = meghCanvas.getContext('2d');

    const rect = meghCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    meghCanvas.width = (rect.width || 320) * dpr;
    meghCanvas.height = 150 * dpr;
    meghCtx.scale(dpr, dpr);

    const w = meghCanvas.width / dpr;
    const h = meghCanvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;

    const providers = [
        { id: 'gdrive', name: 'GDrive', gb: 15, color: '#6fdcf7', angle: 0 },
        { id: 'dropbox', name: 'Dropbox', gb: 2, color: '#3d94ff', angle: (2 * Math.PI) / 5 },
        { id: 'b2', name: 'B2', gb: 10, color: '#fb5c7a', angle: (4 * Math.PI) / 5 },
        { id: 'mega', name: 'MEGA', gb: 20, color: '#ff4d4d', angle: (6 * Math.PI) / 5 },
        { id: 'onedrive', name: 'OneDrive', gb: 5, color: '#e8b45c', angle: (8 * Math.PI) / 5 }
    ];

    // Encrypted packet particles streaming towards center vault
    const packets = [];
    for (let i = 0; i < 28; i++) {
        packets.push({
            pIdx: Math.floor(Math.random() * 5),
            progress: Math.random(),
            speed: 0.006 + Math.random() * 0.008,
            jitter: (Math.random() - 0.5) * 6
        });
    }

    let pulseTime = 0;

    function renderMegh(now) {
        pulseTime += 0.025;
        meghCtx.clearRect(0, 0, w, h);

        const orbitRadius = Math.min(w * 0.38, 56);

        // 1. Orbital Ring Track
        meghCtx.beginPath();
        meghCtx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
        meghCtx.strokeStyle = 'rgba(236, 231, 219, 0.08)';
        meghCtx.lineWidth = 1;
        meghCtx.setLineDash([4, 4]);
        meghCtx.stroke();
        meghCtx.setLineDash([]);

        // 2. Draw Packet Particles
        packets.forEach(pkt => {
            pkt.progress += pkt.speed;
            if (pkt.progress >= 1.0) {
                pkt.progress = 0;
                pkt.pIdx = meghSelectedProvider !== null ? meghSelectedProvider : Math.floor(Math.random() * 5);
            }

            const p = providers[pkt.pIdx];
            const pTheta = p.angle + pulseTime * 0.2;
            const px = cx + orbitRadius * Math.cos(pTheta);
            const py = cy + orbitRadius * Math.sin(pTheta);

            // Interpolate towards center vault
            const curX = px + (cx - px) * pkt.progress + Math.cos(pkt.progress * Math.PI) * pkt.jitter;
            const curY = py + (cy - py) * pkt.progress + Math.sin(pkt.progress * Math.PI) * pkt.jitter;

            meghCtx.beginPath();
            meghCtx.arc(curX, curY, 2, 0, Math.PI * 2);
            meghCtx.fillStyle = p.color;
            meghCtx.shadowColor = p.color;
            meghCtx.shadowBlur = 4;
            meghCtx.fill();
            meghCtx.shadowBlur = 0;
        });

        // 3. Draw Provider Satellite Nodes
        providers.forEach((p, idx) => {
            const pTheta = p.angle + pulseTime * 0.2;
            const px = cx + orbitRadius * Math.cos(pTheta);
            const py = cy + orbitRadius * Math.sin(pTheta);
            const isSelected = meghSelectedProvider === idx;

            meghCtx.beginPath();
            meghCtx.arc(px, py, isSelected ? 8 : 5, 0, Math.PI * 2);
            meghCtx.fillStyle = p.color;
            meghCtx.shadowColor = p.color;
            meghCtx.shadowBlur = isSelected ? 10 : 4;
            meghCtx.fill();
            meghCtx.shadowBlur = 0;

            // Small label
            meghCtx.font = '9px "JetBrains Mono", monospace';
            meghCtx.fillStyle = 'rgba(236, 231, 219, 0.75)';
            meghCtx.textAlign = 'center';
            meghCtx.fillText(p.name, px, py + (py > cy ? 13 : -8));
        });

        // 4. Central AES-256 Vault Core
        const corePulse = 14 + Math.sin(pulseTime * 2) * 2;
        meghCtx.beginPath();
        meghCtx.arc(cx, cy, corePulse, 0, Math.PI * 2);
        meghCtx.fillStyle = 'rgba(11, 11, 20, 0.9)';
        meghCtx.strokeStyle = '#6fdcf7';
        meghCtx.lineWidth = 1.5;
        meghCtx.shadowColor = 'rgba(111, 220, 247, 0.6)';
        meghCtx.shadowBlur = 8;
        meghCtx.fill();
        meghCtx.stroke();
        meghCtx.shadowBlur = 0;

        meghCtx.font = '10px sans-serif';
        meghCtx.textAlign = 'center';
        meghCtx.textBaseline = 'middle';
        meghCtx.fillText('🔒', cx, cy);

        meghAnimId = requestAnimationFrame(renderMegh);
    }

    meghAnimId = requestAnimationFrame(renderMegh);

    // Interactive Provider Chips
    const chipsGrid = stage.querySelector('#megh-chips-grid');
    const capDisp = stage.querySelector('#megh-capacity-display');
    if (chipsGrid) {
        const chips = chipsGrid.querySelectorAll('.megh-provider-chip');
        chips.forEach((chip, idx) => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                if (meghSelectedProvider === idx) {
                    meghSelectedProvider = null;
                    if (capDisp) capDisp.innerText = '52 GB UNIFIED POOL';
                } else {
                    meghSelectedProvider = idx;
                    chip.classList.add('active');
                    const p = providers[idx];
                    if (capDisp) capDisp.innerText = `SHARD ALLOCATION: ${p.name} · ${p.gb} GB`;
                }
            });
        });
    }
}

// --------------------------------------------------------------------------
// EXHIBIT 02: GEO-FNO 2D FOURIER SPECTRAL VORTICITY ENGINE
// --------------------------------------------------------------------------
function setupGeoFNOVisualizer(stage) {
    geofnoCanvas = stage.querySelector('#geofno-vorticity-canvas');
    if (!geofnoCanvas) return;
    geofnoCtx = geofnoCanvas.getContext('2d');

    const rect = geofnoCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = (rect.width || 320) * dpr;
    const ch = 150 * dpr;
    geofnoCanvas.width = cw;
    geofnoCanvas.height = ch;
    geofnoCtx.scale(dpr, dpr);

    const w = cw / dpr;
    const h = ch / dpr;

    // Simulation grid resolution
    const nx = 48;
    const ny = 24;
    let t = 0;

    // Preset base vortices representing coherent atmospheric turbulent eddies
    geofnoVortices = [
        { x: 0.3, y: 0.5, strength: 2.2, radius: 0.18, decay: 0.999 },
        { x: 0.7, y: 0.4, strength: -2.0, radius: 0.20, decay: 0.999 }
    ];

    function injectVortexAt(clientX, clientY, strength = 3.0) {
        const cRect = geofnoCanvas.getBoundingClientRect();
        const normX = (clientX - cRect.left) / cRect.width;
        const normY = (clientY - cRect.top) / cRect.height;
        if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
            geofnoVortices.push({
                x: normX,
                y: normY,
                strength: (Math.random() < 0.5 ? 1 : -1) * (2.5 + Math.random() * 1.5),
                radius: 0.14,
                decay: 0.992
            });
            if (geofnoVortices.length > 8) {
                geofnoVortices.shift();
            }
        }
    }

    // Touch events for direct vortex injection
    geofnoCanvas.addEventListener('pointerdown', (e) => {
        injectVortexAt(e.clientX, e.clientY);
    }, { passive: true });

    let lastDrag = 0;
    geofnoCanvas.addEventListener('pointermove', (e) => {
        const now = performance.now();
        if (now - lastDrag > 60 && (e.buttons > 0 || e.pressure > 0)) {
            lastDrag = now;
            injectVortexAt(e.clientX, e.clientY);
        }
    }, { passive: true });

    function renderGeoFNO() {
        t += 0.035;
        geofnoCtx.clearRect(0, 0, w, h);

        const cellW = w / nx;
        const cellH = h / ny;

        // Attenuate dynamic vortices with Navier-Stokes viscosity
        for (let i = geofnoVortices.length - 1; i >= 0; i--) {
            const v = geofnoVortices[i];
            v.strength *= v.decay;
            v.radius *= 1.002;
            if (Math.abs(v.strength) < 0.05) {
                geofnoVortices.splice(i, 1);
            }
        }

        // Draw 2D fluid vorticity field with Fourier mode truncation
        // Higher modes (k > kMax) are filtered out, displaying zero-shot spectral smoothing
        for (let j = 0; j < ny; j++) {
            const yNorm = j / ny;
            for (let i = 0; i < nx; i++) {
                const xNorm = i / nx;

                // Base Fourier modes up to geofnoKMax
                let omega = 0;
                const modes = Math.min(geofnoKMax, 32);

                // Primary Fourier harmonic 1
                omega += 1.2 * Math.sin(2 * Math.PI * xNorm + t * 0.8) * Math.cos(2 * Math.PI * yNorm);

                if (modes >= 8) {
                    omega += 0.7 * Math.sin(4 * Math.PI * xNorm - t * 1.2) * Math.sin(4 * Math.PI * yNorm + t * 0.5);
                }
                if (modes >= 16) {
                    omega += 0.4 * Math.sin(8 * Math.PI * xNorm + t * 1.8) * Math.cos(6 * Math.PI * yNorm - t);
                }
                if (modes >= 32) {
                    omega += 0.25 * Math.sin(14 * Math.PI * xNorm - t * 2.2) * Math.sin(12 * Math.PI * yNorm);
                }

                // Superimpose active localized vortices
                geofnoVortices.forEach(v => {
                    const dx = xNorm - v.x;
                    const dy = yNorm - v.y;
                    const distSq = dx * dx + dy * dy;
                    omega += v.strength * Math.exp(-distSq / (2 * v.radius * v.radius));
                });

                // Colorize vorticity: Cyclonic (-: cyan), Void (0: dark), Anticyclonic (+: gold)
                const px = i * cellW;
                const py = j * cellH;

                if (omega > 0.2) {
                    const intensity = Math.min(omega / 2.5, 1.0);
                    geofnoCtx.fillStyle = `rgba(232, 180, 92, ${intensity * 0.75})`;
                } else if (omega < -0.2) {
                    const intensity = Math.min(-omega / 2.5, 1.0);
                    geofnoCtx.fillStyle = `rgba(111, 220, 247, ${intensity * 0.75})`;
                } else {
                    geofnoCtx.fillStyle = 'rgba(6, 6, 12, 0.4)';
                }

                geofnoCtx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
            }
        }

        // Draw streamline isoline contour traces
        geofnoCtx.beginPath();
        for (let i = 0; i < 5; i++) {
            const trackY = (h * 0.2) + (i * h * 0.15);
            geofnoCtx.moveTo(0, trackY);
            for (let x = 0; x < w; x += 12) {
                const xN = x / w;
                const yN = trackY / h;
                const wave = Math.sin(xN * 6 + t + i) * 6 * (geofnoKMax / 32);
                geofnoCtx.lineTo(x, trackY + wave);
            }
        }
        geofnoCtx.strokeStyle = 'rgba(236, 231, 219, 0.12)';
        geofnoCtx.lineWidth = 1;
        geofnoCtx.stroke();

        geofnoAnimId = requestAnimationFrame(renderGeoFNO);
    }

    geofnoAnimId = requestAnimationFrame(renderGeoFNO);

    // Mode Bar Buttons
    const modePills = stage.querySelectorAll('#geofno-mode-pills .mode-pill');
    modePills.forEach(pill => {
        pill.addEventListener('click', () => {
            modePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            geofnoKMax = parseInt(pill.getAttribute('data-k'), 10);
        });
    });
}

// --------------------------------------------------------------------------
// EXHIBIT 03: 2D ISING MODEL METROPOLIS SIMULATION
// --------------------------------------------------------------------------
function setupIsingSimulation(stage) {
    isingCanvas = stage.querySelector('#mobile-ising-canvas');
    if (!isingCanvas) return;
    isingCtx = isingCanvas.getContext('2d');

    isingL = 32;
    isingGrid = new Int8Array(isingL * isingL);
    for (let i = 0; i < isingGrid.length; i++) {
        isingGrid[i] = Math.random() < 0.5 ? 1 : -1;
    }

    drawIsing();

    // Direct touch excitation: rubbing finger flips spins
    const exciteAt = (clientX, clientY) => {
        const rect = isingCanvas.getBoundingClientRect();
        const normX = Math.floor(((clientX - rect.left) / rect.width) * isingL);
        const normY = Math.floor(((clientY - rect.top) / rect.height) * isingL);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const gx = (normX + dx + isingL) % isingL;
                const gy = (normY + dy + isingL) % isingL;
                isingGrid[gy * isingL + gx] = 1; // Excite to UP spin
            }
        }
        drawIsing();
    };

    isingCanvas.addEventListener('pointerdown', (e) => exciteAt(e.clientX, e.clientY), { passive: true });
    isingCanvas.addEventListener('pointermove', (e) => {
        if (e.buttons > 0 || e.pressure > 0) exciteAt(e.clientX, e.clientY);
    }, { passive: true });

    const slider = stage.querySelector('#ising-temp-slider');
    const tempDisp = stage.querySelector('#ising-temp-display');
    const toggleBtn = stage.querySelector('#ising-toggle-btn');
    const playIcon = stage.querySelector('#ising-play-icon');
    const playLabel = stage.querySelector('#ising-play-label');

    if (slider) {
        slider.addEventListener('input', (e) => {
            isingTemp = parseFloat(e.target.value);
            if (tempDisp) tempDisp.innerText = isingTemp.toFixed(2);
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isingRunning = !isingRunning;
            if (isingRunning) {
                if (playIcon) playIcon.innerText = '⏸';
                if (playLabel) playLabel.innerText = 'PAUSE';
                isingLoop(stage);
            } else {
                if (playIcon) playIcon.innerText = '▶';
                if (playLabel) playLabel.innerText = 'RUN';
                if (isingAnimId) {
                    cancelAnimationFrame(isingAnimId);
                    isingAnimId = null;
                }
            }
        });
    }
}

function isingStep() {
    const N = isingL * isingL;
    for (let step = 0; step < N; step++) {
        const x = (Math.random() * isingL) | 0;
        const y = (Math.random() * isingL) | 0;
        const idx = y * isingL + x;
        const spin = isingGrid[idx];

        const left = isingGrid[y * isingL + ((x - 1 + isingL) % isingL)];
        const right = isingGrid[y * isingL + ((x + 1) % isingL)];
        const up = isingGrid[((y - 1 + isingL) % isingL) * isingL + x];
        const down = isingGrid[((y + 1) % isingL) * isingL + x];

        const dE = 2 * spin * (left + right + up + down);

        if (dE <= 0 || Math.random() < Math.exp(-dE / isingTemp)) {
            isingGrid[idx] = -spin;
        }
    }
}

function drawIsing() {
    if (!isingCtx || !isingGrid) return;
    const imgData = isingCtx.createImageData(isingL, isingL);
    const data = imgData.data;

    let mag = 0;
    for (let i = 0; i < isingGrid.length; i++) {
        const s = isingGrid[i];
        mag += s;
        const p = i * 4;
        if (s === 1) {
            // Spin UP: Cyan Phosphor (#6fdcf7)
            data[p] = 111;
            data[p + 1] = 220;
            data[p + 2] = 247;
            data[p + 3] = 255;
        } else {
            // Spin DOWN: Midnight Navy (#0b0b14)
            data[p] = 11;
            data[p + 1] = 11;
            data[p + 2] = 20;
            data[p + 3] = 255;
        }
    }

    isingCtx.putImageData(imgData, 0, 0);

    isingCtx.imageSmoothingEnabled = false;
    isingCtx.drawImage(isingCanvas, 0, 0, isingL, isingL, 0, 0, isingCanvas.width, isingCanvas.height);

    return mag / (isingL * isingL);
}

function isingLoop(stage) {
    if (!isingRunning) return;
    isingStep();
    const mag = drawIsing();
    const magDisp = stage.querySelector('#ising-mag-display');
    if (magDisp && typeof mag === 'number') {
        magDisp.innerText = (mag >= 0 ? '+' : '') + mag.toFixed(2);
    }
    isingAnimId = requestAnimationFrame(() => isingLoop(stage));
}

// --------------------------------------------------------------------------
// QUANTUM ARCHIVE DRAWER
// --------------------------------------------------------------------------
async function loadAndRenderArchive(container) {
    const listEl = container.querySelector('#archive-drawer-list');
    const countEl = container.querySelector('#archive-count');
    const searchInput = container.querySelector('#archive-search-input');
    const catChips = container.querySelectorAll('#archive-category-chips .mobile-chip');

    if (researchData.length === 0) {
        try {
            const res = await fetch('/data/research.json');
            researchData = await res.json();
        } catch (err) {
            console.error("Failed to load research.json:", err);
            researchData = [];
        }
    }

    const renderList = () => {
        let items = [...researchData];

        if (archiveFilter !== 'ALL') {
            if (archiveFilter === 'ML_AI' || archiveFilter === 'AI/ML') {
                items = items.filter(it => it.category === 'ML_AI' || it.category === 'AI/ML');
            } else {
                items = items.filter(it => it.category === archiveFilter);
            }
        }

        if (archiveSearchQuery.trim()) {
            const q = archiveSearchQuery.toLowerCase();
            items = items.filter(it => {
                const titleMatch = it.title && it.title.toLowerCase().includes(q);
                const descMatch = it.desc && it.desc.toLowerCase().includes(q);
                const tagMatch = Array.isArray(it.tags) && it.tags.some(t => t.toLowerCase().includes(q));
                return titleMatch || descMatch || tagMatch;
            });
        }

        if (countEl) countEl.innerText = `[${items.length} ITEMS]`;

        if (items.length === 0) {
            listEl.innerHTML = `<div class="mobile-empty-state">No research documents matched your query.</div>`;
            return;
        }

        let html = '';
        items.forEach((item, index) => {
            const tagsHtml = Array.isArray(item.tags) && item.tags.length > 0
                ? `<div class="archive-item-tags">
                    ${item.tags.map(t => `<span class="archive-tag-pill">${t}</span>`).join('')}
                   </div>`
                : '';

            const collabsHtml = Array.isArray(item.collaborators) && item.collaborators.length > 0
                ? `<div class="archive-collaborators">Co-authors: <strong>${item.collaborators.join(', ')}</strong></div>`
                : '';

            const linkBtn = item.link
                ? `<a href="${item.link}" target="_blank" rel="noopener" class="archive-link-chip">
                    <span>${item.link.includes('doi.org') ? 'DOI PAPER' : 'SOURCE CODE'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                   </a>`
                : '';

            html += `
                <div class="mobile-archive-card" data-index="${index}">
                    <div class="archive-card-meta">
                        <span class="archive-id-badge">${item.id || 'PUB'}</span>
                        <span class="archive-cat-badge">${item.category || 'THEORY'}</span>
                    </div>
                    <h3 class="archive-card-title">${item.title}</h3>
                    <div class="archive-card-desc math-renderable">${item.desc || 'Theoretical derivation and numerical experiment.'}</div>
                    ${collabsHtml}
                    <div class="archive-card-footer">
                        ${tagsHtml}
                        ${linkBtn}
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html;

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([listEl]).catch(err => console.warn("MathJax typeset error:", err));
        }
    };

    renderList();

    if (searchInput) {
        searchInput.value = archiveSearchQuery;
        searchInput.oninput = (e) => {
            archiveSearchQuery = e.target.value;
            renderList();
        };
    }

    catChips.forEach(chip => {
        chip.onclick = () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            archiveFilter = chip.getAttribute('data-cat');
            renderList();
        };
    });
}
