// ==========================================================================
// Spacetime Portfolio — Mobile Page: Technical Arsenal (Tab 04)
// 6 Categorized domains loaded from hobbies.json with real SVG icons & search
// ==========================================================================

import { ICON_MAP } from '../../components/hobbies.js';
import { triggerHaptic } from '../chronoDial.js';

let arsenalData = [];
let activeCategory = 'ALL';
let searchQuery = '';
let selectedSkill = null;

export async function renderTabArsenal(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-arsenal-container">
            <!-- Header -->
            <div class="mobile-arsenal-header">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[04]</span>
                    <h1 class="mobile-section-heading">TECHNICAL ARSENAL</h1>
                </div>

                <!-- Search & Soothing Filter Pills -->
                <div class="mobile-search-row">
                    <input type="text" id="arsenal-search-input" class="mobile-search-input" placeholder="Search 121 skills, math, frameworks..." aria-label="Search technical arsenal" />
                </div>
                <div class="mobile-filter-chips scrollable" id="arsenal-category-chips">
                    <button class="mobile-chip active" data-cat="ALL">All (121)</button>
                    <button class="mobile-chip" data-cat="physics">Physics</button>
                    <button class="mobile-chip" data-cat="math">Mathematics</button>
                    <button class="mobile-chip" data-cat="ai">AI / ML</button>
                    <button class="mobile-chip" data-cat="security">Security</button>
                    <button class="mobile-chip" data-cat="dev">Software</button>
                    <button class="mobile-chip" data-cat="tools">Dev Tools</button>
                </div>
            </div>

            <!-- Skills Matrix Container -->
            <div class="mobile-arsenal-grid" id="arsenal-grid">
                <div class="mobile-loading-skeleton">Loading Arsenal Matrices...</div>
            </div>
        </div>
    `;

    // Load data
    if (arsenalData.length === 0) {
        try {
            const res = await fetch('/data/hobbies.json');
            arsenalData = await res.json();
        } catch (err) {
            console.error("Failed to load hobbies.json:", err);
            arsenalData = [];
        }
    }

    renderSkills(container);

    // Hook search
    const searchInput = container.querySelector('#arsenal-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            renderSkills(container);
        };
    }

    // Hook category chips
    const chips = container.querySelectorAll('#arsenal-category-chips .mobile-chip');
    chips.forEach(chip => {
        chip.onclick = () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCategory = chip.getAttribute('data-cat');
            renderSkills(container);
        };
    });
}

function renderSkills(container) {
    const gridEl = container.querySelector('#arsenal-grid');
    if (!gridEl) return;

    let items = [];

    // Flatten items with their category info
    arsenalData.forEach(cat => {
        const catId = cat.id || (cat.category ? cat.category.toLowerCase() : 'other');
        const catTitle = cat.category || 'Category';

        if (Array.isArray(cat.items)) {
            cat.items.forEach(it => {
                items.push({
                    name: it.name,
                    category: catTitle,
                    categoryId: catId,
                    timeRange: it.time_range ? `${it.time_range.start} – ${it.time_range.end}` : '',
                    type: it.type || 'skill'
                });
            });
        }
    });

    // Category filter
    if (activeCategory !== 'ALL') {
        items = items.filter(it => {
            const cId = it.categoryId.toLowerCase();
            const aCat = activeCategory.toLowerCase();
            if (aCat === 'physics') return cId.includes('physic');
            if (aCat === 'math') return cId.includes('math');
            if (aCat === 'ai') return cId.includes('ai') || cId.includes('learn') || cId.includes('data');
            if (aCat === 'security') return cId.includes('sec') || cId.includes('system');
            if (aCat === 'dev') return cId.includes('dev') || cId.includes('soft') || cId.includes('web');
            if (aCat === 'tools') return cId.includes('tool') || cId.includes('plat');
            return cId === aCat;
        });
    }

    // Search query filter
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(it => {
            return (it.name && it.name.toLowerCase().includes(q)) ||
                   (it.category && it.category.toLowerCase().includes(q));
        });
    }

    if (items.length === 0) {
        gridEl.innerHTML = `<div class="mobile-empty-state">No technical skills matched your search criteria.</div>`;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        const iconPath = ICON_MAP[item.name] || '';
        const isSelected = selectedSkill && selectedSkill.name === item.name;

        html += `
            <div class="mobile-skill-cell ${isSelected ? 'active' : ''}" data-idx="${index}" data-name="${item.name}" data-cat="${item.category}" data-range="${item.timeRange}">
                <div class="skill-cell-icon-wrap">
                    ${iconPath ? `<img src="${iconPath}" alt="${item.name}" class="skill-svg-icon" loading="lazy" onerror="this.style.display='none'" />` : `<span class="skill-icon-placeholder">⬡</span>`}
                </div>
                <div class="skill-cell-meta">
                    <span class="skill-cell-name">${item.name}</span>
                    <span class="skill-cell-cat">${item.category}</span>
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;

    // Attach click inspection to Viewport-Docked Floating Inspector
    const cells = gridEl.querySelectorAll('.mobile-skill-cell');
    const inspector = document.getElementById('arsenal-inspector');
    const closeBtn = document.getElementById('inspector-close-btn');

    if (closeBtn && inspector) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            triggerHaptic(6);
            inspector.classList.remove('visible');
            setTimeout(() => {
                if (!inspector.classList.contains('visible')) {
                    inspector.style.display = 'none';
                }
            }, 250);
            cells.forEach(c => c.classList.remove('active'));
            selectedSkill = null;
        };
    }

    cells.forEach(cell => {
        cell.onclick = () => {
            triggerHaptic(10);
            cells.forEach(c => c.classList.remove('active'));
            cell.classList.add('active');

            const name = cell.getAttribute('data-name');
            const cat = cell.getAttribute('data-cat');
            const range = cell.getAttribute('data-range');

            selectedSkill = { name, category: cat, timeRange: range };

            const insTitle = document.getElementById('inspector-skill-title');
            const insDesc = document.getElementById('inspector-skill-desc');
            const insIcon = document.getElementById('inspector-icon-wrap');

            if (insTitle && insDesc) {
                insTitle.textContent = name;
                insDesc.innerHTML = `<span>${cat}</span>${range ? ` · <span class="inspector-range">${range}</span>` : ''}`;
            }

            if (insIcon) {
                const iconPath = ICON_MAP[name] || '';
                insIcon.innerHTML = iconPath
                    ? `<img src="${iconPath}" alt="${name}" class="inspector-svg-icon" onerror="this.style.display='none'" />`
                    : `<span class="inspector-icon-placeholder">◈</span>`;
            }

            if (inspector) {
                inspector.style.display = 'flex';
                requestAnimationFrame(() => {
                    inspector.classList.add('visible');
                });
            }
        };
    });
}
