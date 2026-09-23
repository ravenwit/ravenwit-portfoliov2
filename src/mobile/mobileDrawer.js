// ==========================================================================
// Spacetime Portfolio — Mobile Tactical Drawer (Branch: mobile2)
// Arsenal Matrix Sheet, Klein-Gordon Markdown/MathJax Documentation Reader
// ==========================================================================

import { STATE } from '../state.js';
import { marked } from 'marked';
import kleinGordonContent from '../../klein-gordon.md?raw';

let drawerRoot = null;
let currentTab = 'AREAS';
let onDrawerStateChange = null;

export function initMobileDrawer(stateChangeCallback) {
    onDrawerStateChange = stateChangeCallback;
    drawerRoot = document.getElementById('mobile-drawer-root');
    if (!drawerRoot) return;

    drawerRoot.style.display = 'flex';
    drawerRoot.innerHTML = `
        <div class="mobile-drawer-header">
            <div class="mobile-drawer-title-wrap">
                <span class="chrono-pulse-dot"></span>
                <span id="mobile-drawer-title" class="mobile-drawer-title">ARSENAL MATRIX</span>
                <span id="mobile-drawer-count" style="font-size: 10px; color: var(--mobile-gold);">[121 ITEMS]</span>
            </div>
            <button id="mobile-drawer-close" class="mobile-drawer-close-btn" aria-label="Close Tactical Drawer">✕ CLOSE</button>
        </div>
        <div id="mobile-drawer-tabs" class="mobile-drawer-tabs">
            <button class="mobile-drawer-tab active" data-tab="AREAS">01 AREAS (6×6)</button>
            <button class="mobile-drawer-tab" data-tab="CATEGORIES">02 TECH (7×7)</button>
            <button class="mobile-drawer-tab" data-tab="TOOLS">03 TOOLS (6×6)</button>
        </div>
        <div class="mobile-drawer-body" id="mobile-drawer-body">
            <!-- Dynamic Content Mounted Here -->
        </div>
    `;

    const closeBtn = document.getElementById('mobile-drawer-close');
    closeBtn.addEventListener('click', closeMobileDrawer);

    // Tab buttons
    const tabBtns = drawerRoot.querySelectorAll('.mobile-drawer-tab');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.getAttribute('data-tab');
            renderArsenalTab(currentTab);
        });
    });
}

export function openArsenalDrawer() {
    if (!drawerRoot) return;
    STATE.isDrawerOpen = true;
    if (onDrawerStateChange) onDrawerStateChange(true);

    const tabsEl = document.getElementById('mobile-drawer-tabs');
    if (tabsEl) tabsEl.style.display = 'flex';

    const titleEl = document.getElementById('mobile-drawer-title');
    const countEl = document.getElementById('mobile-drawer-count');
    if (titleEl) titleEl.innerText = 'ARSENAL MATRIX';
    if (countEl) countEl.innerText = '[121 SKILLS]';

    renderArsenalTab(currentTab);
    drawerRoot.classList.add('open');
}

function renderArsenalTab(tab) {
    const body = document.getElementById('mobile-drawer-body');
    if (!body) return;

    let sourceId = 'matrix-areas';
    let is7x7 = false;

    if (tab === 'CATEGORIES') {
        sourceId = 'matrix-categories';
        is7x7 = true;
    } else if (tab === 'TOOLS') {
        sourceId = 'matrix-tools';
    }

    const sourceEl = document.getElementById(sourceId);
    const cells = sourceEl ? Array.from(sourceEl.querySelectorAll('.cell')) : [];

    let cellsHtml = '';
    cells.forEach((cell, idx) => {
        const img = cell.querySelector('img');
        const iconSrc = img ? img.getAttribute('src') : '';
        const title = cell.getAttribute('title') || cell.innerText.trim() || `Node ${idx + 1}`;
        const hasContent = iconSrc || title;

        cellsHtml += `
            <div class="mobile-arsenal-cell ${hasContent ? 'has-item' : ''}" data-name="${title}" data-icon="${iconSrc}">
                ${iconSrc ? `<img src="${iconSrc}" class="mobile-arsenal-icon" alt="${title}" loading="lazy"/>` : ''}
                <span class="mobile-arsenal-name">${title}</span>
            </div>
        `;
    });

    body.innerHTML = `
        <div class="mobile-arsenal-grid ${is7x7 ? 'grid-7x7' : 'grid-6x6'}">
            ${cellsHtml}
        </div>
        <div id="mobile-inspector" class="mobile-arsenal-inspector">
            <div id="mobile-inspector-title" class="mobile-inspector-title">TACTILE INSPECTOR</div>
            <div id="mobile-inspector-desc" class="mobile-inspector-desc">Tap any grid matrix cell to inspect skill coordinates and telemetry.</div>
        </div>
    `;

    // Cell tap inspector
    const gridCells = body.querySelectorAll('.mobile-arsenal-cell');
    gridCells.forEach(cell => {
        cell.addEventListener('click', () => {
            gridCells.forEach(c => c.classList.remove('active'));
            cell.classList.add('active');

            const name = cell.getAttribute('data-name');
            const icon = cell.getAttribute('data-icon');
            const insTitle = document.getElementById('mobile-inspector-title');
            const insDesc = document.getElementById('mobile-inspector-desc');

            if (insTitle && insDesc && name) {
                insTitle.innerHTML = `<span style="color:var(--mobile-quantum);">[NODE]</span> ${name}`;
                insDesc.innerHTML = `Skill Matrix: <strong>${tab}</strong> · Telemetry coordinates verified and active.`;
            }
        });
    });
}

export async function openDocumentationReader(filePath = '/klein-gordon.md', title = 'klein-gordon.md') {
    if (!drawerRoot) return;
    STATE.isDrawerOpen = true;
    if (onDrawerStateChange) onDrawerStateChange(true);

    const tabsEl = document.getElementById('mobile-drawer-tabs');
    if (tabsEl) tabsEl.style.display = 'none';

    const titleEl = document.getElementById('mobile-drawer-title');
    const countEl = document.getElementById('mobile-drawer-count');
    if (titleEl) titleEl.innerText = title;
    if (countEl) countEl.innerText = '[THEORY ARCHIVE]';

    const body = document.getElementById('mobile-drawer-body');
    if (body) {
        body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--mobile-quantum); font-family: var(--mobile-font-mono); font-size: 12px; gap: 8px;">
                <span class="chrono-pulse-dot"></span>
                <span>DECRYPTING QUANTUM ARCHIVE...</span>
            </div>
        `;
    }

    drawerRoot.classList.add('open');

    try {
        let mdText = kleinGordonContent;
        if (filePath && filePath !== '/klein-gordon.md' && filePath !== 'klein-gordon.md') {
            const res = await fetch(filePath);
            mdText = await res.text();
        }
        const htmlContent = marked.parse(mdText);

        if (body) {
            body.innerHTML = `
                <div class="mobile-doc-content" id="mobile-doc-content">
                    ${htmlContent}
                </div>
            `;

            // Render MathJax equations
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([body]).catch(err => {
                    console.warn('MathJax typesetting warning:', err);
                });
            }
        }
    } catch (err) {
        if (body) {
            body.innerHTML = `<div style="color: #ff5555; padding: 20px;">Failed to load documentation: ${err.message}</div>`;
        }
    }
}

export function closeMobileDrawer() {
    if (!drawerRoot) return;
    drawerRoot.classList.remove('open');
    STATE.isDrawerOpen = false;
    if (onDrawerStateChange) onDrawerStateChange(false);
}
