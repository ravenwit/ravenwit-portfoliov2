// ==========================================================================
// Spacetime Portfolio — Mobile Page: Works & Highlights (Tab 03)
// 3 Highlights (Megh, Geo-FNO, Ising) + Projects & Research Archive Subview
// ==========================================================================

let activeHighlight = 0; // 0: Megh, 1: Geo-FNO, 2: Ising
let archiveOpen = false;
let researchData = [];
let archiveFilter = 'ALL';
let archiveSearchQuery = '';

// Ising canvas state
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
                
                <!-- Highlight Switcher Tabs -->
                <div class="mobile-highlight-nav">
                    <button class="mobile-hl-btn ${activeHighlight === 0 ? 'active' : ''}" data-hl="0">01 MEGH</button>
                    <button class="mobile-hl-btn ${activeHighlight === 1 ? 'active' : ''}" data-hl="1">02 GEO-FNO</button>
                    <button class="mobile-hl-btn ${activeHighlight === 2 ? 'active' : ''}" data-hl="2">03 ISING</button>
                </div>
            </div>

            <!-- Active Highlight Display Stage -->
            <div class="mobile-highlight-stage" id="mobile-highlight-stage">
                <!-- Dynamically rendered highlight card -->
            </div>

            <!-- Prominent Archive CTA -->
            <div class="mobile-archive-cta-banner">
                <div class="archive-banner-info">
                    <span class="archive-banner-tag">FULL QUANTUM ARCHIVE</span>
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
                    <button class="mobile-chip ${archiveFilter === 'AI/ML' ? 'active' : ''}" data-cat="AI/ML">AI/ML</button>
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

function renderHighlightCard(container) {
    const stage = container.querySelector('#mobile-highlight-stage');
    if (!stage) return;

    // Clean up previous ising simulation if running
    if (isingAnimId) {
        cancelAnimationFrame(isingAnimId);
        isingAnimId = null;
    }
    isingRunning = false;

    if (activeHighlight === 0) {
        // MEGH
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 01 / 03</span>
                    <span class="hl-tag">CLOUD SYSTEMS & CRYPTOGRAPHY</span>
                </div>
                <h2 class="hl-title">MEGH // ENCRYPTED CLOUD VAULT</h2>
                <p class="hl-desc">
                    Client-side encrypted zero-knowledge storage vault that aggregates free tiers across Google Drive, Dropbox, Backblaze B2, MEGA, and OneDrive into a unified 52 GB virtual storage pool.
                </p>

                <div class="hl-preview-box megh-visual-box">
                    <div class="megh-storage-schematic">
                        <div class="megh-provider-pill-grid">
                            <span class="megh-provider-chip gdrive">Google Drive 15GB</span>
                            <span class="megh-provider-chip dropbox">Dropbox 2GB</span>
                            <span class="megh-provider-chip b2">Backblaze 10GB</span>
                            <span class="megh-provider-chip mega">MEGA 20GB</span>
                            <span class="megh-provider-chip onedrive">OneDrive 5GB</span>
                        </div>
                        <div class="megh-vault-indicator">
                            <span class="vault-icon">🔒</span>
                            <span class="vault-sum">52 GB UNIFIED VAULT</span>
                            <span class="vault-sub">AES-256-GCM Zero-Knowledge Sharding</span>
                        </div>
                    </div>
                </div>

                <div class="hl-specs-grid">
                    <div class="hl-spec-item">
                        <span class="spec-label">ENCRYPTION</span>
                        <span class="spec-val">Client-Side AES-256-GCM</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">UNIFIED CAPACITY</span>
                        <span class="spec-val">52 GB Aggregated Pool</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">SHARDING</span>
                        <span class="spec-val">Dynamic Chunk Redundancy</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">STORAGE PROVIDERS</span>
                        <span class="spec-val">5 Major Multi-Cloud Tiers</span>
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
    } else if (activeHighlight === 1) {
        // GEO-FNO
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 02 / 03</span>
                    <span class="hl-tag">PDE OPERATOR LEARNING</span>
                </div>
                <h2 class="hl-title">GEO-FNO // GEOMETRIC NEURAL OPERATOR</h2>
                <p class="hl-desc">
                    Fourier Neural Operator formulated on non-Euclidean spherical geometry predicting atmospheric fluid vorticity and Navier-Stokes dynamics directly across curved spacetime meshes.
                </p>

                <div class="hl-preview-box geofno-visual-box">
                    <div class="geofno-sphere-graphic">
                        <div class="sphere-latitude lat-1"></div>
                        <div class="sphere-latitude lat-2"></div>
                        <div class="sphere-latitude lat-3"></div>
                        <div class="sphere-vortex-point p1"></div>
                        <div class="sphere-vortex-point p2"></div>
                    </div>
                    <div class="megh-caption">SPHERICAL SPECTRAL OPERATOR MESH</div>
                </div>

                <div class="hl-specs-grid">
                    <div class="hl-spec-item">
                        <span class="spec-label">DOMAIN</span>
                        <span class="spec-val">Spherical Manifold S²</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">SPECTRAL MODES</span>
                        <span class="spec-val">Fourier k_max = 32</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">CONVERGENCE</span>
                        <span class="spec-val">Relative L2 &lt; 1.2%</span>
                    </div>
                    <div class="hl-spec-item">
                        <span class="spec-label">SPEEDUP OVER SOLVER</span>
                        <span class="spec-val">340× Acceleration</span>
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
    } else if (activeHighlight === 2) {
        // ISING MODEL with LIVE 2D SIMULATION!
        stage.innerHTML = `
            <div class="mobile-highlight-card">
                <div class="hl-badge-row">
                    <span class="hl-number">EXHIBIT 03 / 03</span>
                    <span class="hl-tag">STATISTICAL MECHANICS</span>
                </div>
                <h2 class="hl-title">2D ISING // METROPOLIS DYNAMICS</h2>
                <p class="hl-desc">
                    Interactive Metropolis-Hastings Monte Carlo simulation of spontaneous symmetry breaking and ferromagnetic phase transitions at critical temperature <em>T_c ≈ 2.269</em>.
                </p>

                <!-- Live Mini Lattice Canvas -->
                <div class="hl-ising-interactive">
                    <div class="ising-canvas-wrap">
                        <canvas id="mobile-ising-canvas" width="128" height="128"></canvas>
                        <div class="ising-telemetry-overlay">
                            <span>T: <strong id="ising-temp-display">2.27</strong></span>
                            <span>M: <strong id="ising-mag-display">+0.82</strong></span>
                        </div>
                    </div>
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
                        <span class="spec-val">T_c = 2 / ln(1 + √2) ≈ 2.269</span>
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

function setupIsingSimulation(stage) {
    isingCanvas = stage.querySelector('#mobile-ising-canvas');
    if (!isingCanvas) return;
    isingCtx = isingCanvas.getContext('2d');

    // Init 32x32 spins
    isingL = 32;
    isingGrid = new Int8Array(isingL * isingL);
    for (let i = 0; i < isingGrid.length; i++) {
        isingGrid[i] = Math.random() < 0.5 ? 1 : -1;
    }

    drawIsing();

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
    // Perform N sweep steps
    for (let step = 0; step < N; step++) {
        const x = (Math.random() * isingL) | 0;
        const y = (Math.random() * isingL) | 0;
        const idx = y * isingL + x;
        const spin = isingGrid[idx];

        // Periodic boundary neighbors
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
            // Spin UP: Emerald / Cyan Phosphor
            data[p] = 0;
            data[p + 1] = 255;
            data[p + 2] = 170;
            data[p + 3] = 255;
        } else {
            // Spin DOWN: Deep Violet / Dark Navy
            data[p] = 15;
            data[p + 1] = 20;
            data[p + 2] = 35;
            data[p + 3] = 255;
        }
    }

    isingCtx.putImageData(imgData, 0, 0);

    // Scale up to 128x128 with pixelated crispness
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
            items = items.filter(it => it.category === archiveFilter);
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

        // Render MathJax if loaded
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([listEl]).catch(err => console.warn("MathJax typeset error:", err));
        }
    };

    renderList();

    // Hook search
    if (searchInput) {
        searchInput.value = archiveSearchQuery;
        searchInput.oninput = (e) => {
            archiveSearchQuery = e.target.value;
            renderList();
        };
    }

    // Hook category chips
    catChips.forEach(chip => {
        chip.onclick = () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            archiveFilter = chip.getAttribute('data-cat');
            renderList();
        };
    });
}
