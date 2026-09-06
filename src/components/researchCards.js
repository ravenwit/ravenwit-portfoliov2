// --- Pillar 03: Quantum Archive (Dual-Hemisphere Catalog) ---
import { researchMouse } from './researchBackground.js';

let allResearchData = [];
let activeCategory = 'ALL';
let searchQuery = '';

export const CATEGORY_DISPLAY_MAP = {
    'ALL': 'ALL',
    'THEORY': 'THEORY',
    'COMPUTATIONAL': 'COMPUTATIONAL',
    'DEVOPS': 'DEVOPS',
    'ML_AI': 'ML & AI',
    'DESIGN': 'DESIGN'
};

function classifyCategory(item) {
    if (item.category) return item.category.toUpperCase();

    const text = `${item.title} ${(item.tags || []).join(' ')} ${item.desc || ''}`.toLowerCase();

    // 1. DESIGN: Video editing, graphic design, LaTeX formatting
    if (text.includes('premiere') || text.includes('after effects') || text.includes('canva') || 
        text.includes('filmora') || text.includes('latex') || text.includes('proposal') || 
        text.includes('protest') || text.includes('dance ovc')) {
        return 'DESIGN';
    }

    // 2. ML & AI: Neural networks, deep learning, inference, YOLO, RNN, LSTM
    if (text.includes('machine learning') || text.includes('deep learning') || text.includes('neural') || 
        text.includes('resnet') || text.includes('face') || text.includes('yolo') || 
        text.includes('rnn') || text.includes('lstm') || text.includes('trigger word') || 
        text.includes('speech recognition') || text.includes('tensorflow') || text.includes('keras') || 
        text.includes('statistical inference') || text.includes('jazz improvisation')) {
        return 'ML_AI';
    }

    // 3. DEVOPS: Networking sockets, deployment, portfolios, servers
    if (text.includes('devops') || text.includes('docker') || text.includes('socket') || 
        text.includes('networking') || text.includes('gatsby') || text.includes('portfolio')) {
        return 'DEVOPS';
    }

    // 4. THEORY: Analytical physics, PMNS, relativity, quantum theory, orbital mechanics
    if (text.includes('radioactive') || text.includes('relativistic dynamics') || 
        text.includes('neutrino oscillation') || text.includes('pmns') || text.includes('feynman')) {
        return 'THEORY';
    }

    // 5. COMPUTATIONAL: Numerical simulation, algorithms, calculators, solvers
    return 'COMPUTATIONAL';
}

function updatePillCounts() {
    const counts = { ALL: allResearchData.length, THEORY: 0, COMPUTATIONAL: 0, DEVOPS: 0, ML_AI: 0, DESIGN: 0 };
    allResearchData.forEach(item => {
        if (counts[item.category] !== undefined) {
            counts[item.category]++;
        }
    });

    const pills = document.querySelectorAll('.archive-pill');
    pills.forEach(pill => {
        const cat = pill.dataset.cat;
        const label = CATEGORY_DISPLAY_MAP[cat] || cat;
        if (counts[cat] !== undefined) {
            pill.textContent = `${label} (${counts[cat]})`;
        }
    });
}

export async function initResearchCards() {
    const container = document.getElementById('research-cards-container');
    if (!container) return;

    try {
        const res = await fetch('/data/research.json');
        if (!res.ok) throw new Error("Failed to fetch research cards data");
        allResearchData = await res.json();

        // Assign computed category
        allResearchData.forEach(item => {
            item.category = classifyCategory(item);
        });

        const countBadge = document.getElementById('archive-total-count');
        if (countBadge) {
            countBadge.textContent = `${allResearchData.length} ENTRIES`;
        }

        updatePillCounts();
        renderArchiveCatalog();
        setupArchiveListeners();

    } catch (e) {
        console.error("Failed to load research.json:", e);
    }
}

function renderArchiveCatalog() {
    const container = document.getElementById('research-cards-container');
    if (!container) return;

    const query = searchQuery.trim().toLowerCase();
    const filtered = allResearchData.filter(item => {
        const matchesCategory = (activeCategory === 'ALL' || item.category === activeCategory);
        if (!matchesCategory) return false;
        if (!query) return true;

        const hay = `${item.title} ${item.id} ${(item.tags || []).join(' ')} ${(item.collaborators || []).join(' ')} ${item.desc || ''}`.toLowerCase();
        return hay.includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="archive-empty-state">
                <span class="empty-icon">∅</span>
                <span class="empty-text">NO MATCHING QUANTUM ARCHIVE RECORDS FOUND</span>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((data, i) => {
        const numStr = (i + 1).toString().padStart(2, '0');
        const hasDoi = data.link && data.link.includes('doi.org');
        const linkLabel = hasDoi ? 'DOI ↗' : 'CODE ↗';

        return `
            <div class="archive-row" id="archive-row-${i}" data-category="${data.category}">
                <div class="archive-row-header">
                    <div class="archive-row-left">
                        <span class="archive-row-idx">${numStr}</span>
                        <span class="archive-row-year">${data.id}</span>
                        <h3 class="archive-row-title">${data.title}</h3>
                    </div>
                    <div class="archive-row-actions">
                        ${data.link ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="archive-action-link" aria-label="Open external resource">${linkLabel}</a>` : ''}
                        <button class="archive-abstract-btn" aria-expanded="false" data-idx="${i}">
                            <span class="abstract-btn-icon">+</span>
                            <span>ABSTRACT</span>
                        </button>
                    </div>
                </div>

                ${data.collaborators && data.collaborators.length > 0 ? `
                    <div class="archive-row-collab">
                        <span class="collab-label">COLLABORATION //</span>
                        <span>${data.collaborators.join(', ')}</span>
                    </div>
                ` : ''}

                <div class="archive-row-tags">
                    <span class="archive-cat-badge ${(data.category || '').toLowerCase().replace(/[^a-z0-9]/g, '_')}">${CATEGORY_DISPLAY_MAP[data.category] || data.category}</span>
                    ${(data.tags || []).map(t => `<span class="archive-tag">${t}</span>`).join('')}
                </div>

                <div class="archive-abstract-drawer" id="archive-drawer-${i}" style="display: none;">
                    <div class="archive-abstract-content">${data.desc}</div>
                </div>
            </div>
        `;
    }).join('');

    // Wire abstract expansion buttons
    container.querySelectorAll('.archive-abstract-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = btn.dataset.idx;
            const drawer = document.getElementById(`archive-drawer-${idx}`);
            const icon = btn.querySelector('.abstract-btn-icon');
            if (!drawer) return;

            const isExpanded = drawer.style.display !== 'none';
            if (isExpanded) {
                drawer.style.display = 'none';
                btn.classList.remove('active');
                if (icon) icon.textContent = '+';
                btn.setAttribute('aria-expanded', 'false');
            } else {
                drawer.style.display = 'block';
                btn.classList.add('active');
                if (icon) icon.textContent = '−';
                btn.setAttribute('aria-expanded', 'true');

                // Typeset math inside the opened drawer
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([drawer]).catch(() => {});
                }
            }
        });
    });

    // Wire sensory wave disturbance on hover
    container.querySelectorAll('.archive-row').forEach(row => {
        row.addEventListener('mouseenter', () => {
            researchMouse.x = window.innerWidth * 0.35;
            researchMouse.y = window.innerHeight * 0.45;
            researchMouse.vx = 5.0;
            researchMouse.vy = 5.0;
        });
    });
}

function setupArchiveListeners() {
    // Category Filter Pills
    const pills = document.querySelectorAll('.archive-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.cat || 'ALL';
            renderArchiveCatalog();
        });
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('archive-search-input');
    let searchDebounce = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                searchQuery = e.target.value;
                renderArchiveCatalog();
            }, 120);
        });
    }
}

// Preserve export compatibility with existing transitions and animate.js
export function updateResearchCards(currentScroll) {
    // Left-hemisphere particle phase and wave velocity are driven in animate.js.
    // Right hemisphere uses smooth native container scroll.
}
