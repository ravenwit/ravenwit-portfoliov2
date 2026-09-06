// --- Pillar 03: Quantum Archive (Dual-Hemisphere Catalog) ---
import { researchMouse } from './researchBackground.js';

let allResearchData = [];
let activeCategory = 'ALL';
let searchQuery = '';

function classifyCategory(item) {
    const text = `${item.title} ${(item.tags || []).join(' ')} ${item.desc || ''}`.toLowerCase();
    if (text.includes('machine learning') || text.includes('inference') || text.includes('ising') || text.includes('neural') || text.includes('deep learning')) {
        return 'ML';
    }
    if (text.includes('quantum') || text.includes('relativistic') || text.includes('orbit') || text.includes('particle') || text.includes('pmns') || text.includes('electromagnetic') || text.includes('waste') || text.includes('conformal') || text.includes('field')) {
        return 'THEORY';
    }
    return 'COMPUTATION';
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
                    <span class="archive-cat-badge ${data.category.toLowerCase()}">${data.category}</span>
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
