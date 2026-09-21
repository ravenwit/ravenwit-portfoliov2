// ==========================================================================
// Spacetime Portfolio — Microfiche Card Deck Component (Branch: mobile2)
// Rolodex Card-by-Card Presentation for the Quantum Archive
// ==========================================================================

import { openDocumentationReader } from './mobileDrawer.js';

let researchData = [];
let activeIndex = 0;
let deckContainer = null;
let onCardChangeCallback = null;

export async function initMicroficheDeck(onCardChange) {
    onCardChangeCallback = onCardChange;
    const rightHemi = document.getElementById('right-hemi');
    if (!rightHemi) return;

    // Create deck container
    let existing = document.getElementById('microfiche-deck-container');
    if (!existing) {
        deckContainer = document.createElement('div');
        deckContainer.id = 'microfiche-deck-container';
        deckContainer.className = 'microfiche-deck-container';
        rightHemi.appendChild(deckContainer);
    } else {
        deckContainer = existing;
    }

    // Touch swipe handling directly on the deck
    let touchStartX = 0;
    let touchStartY = 0;
    deckContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    deckContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        // Vertical swipe up -> Open documentation reader
        if (dy < -60 && Math.abs(dy) > Math.abs(dx)) {
            openDocumentationReader('/klein-gordon.md', 'klein-gordon.md');
            return;
        }

        // Horizontal swipe -> Step cards
        if (Math.abs(dx) > 45) {
            if (dx > 0) {
                stepMicrofiche(-1);
            } else {
                stepMicrofiche(1);
            }
        }
    }, { passive: true });

    // Fetch research data
    try {
        const res = await fetch('/data/research.json');
        researchData = await res.json();
        renderActiveCard();
    } catch (err) {
        console.error("Failed to load microfiche archive data:", err);
    }
}

export function setMicroficheIndex(index) {
    if (researchData.length === 0) return;
    const clamped = Math.max(0, Math.min(researchData.length - 1, index));
    if (clamped !== activeIndex) {
        activeIndex = clamped;
        renderActiveCard();
        if (onCardChangeCallback) onCardChangeCallback(activeIndex);
    }
}

export function stepMicrofiche(delta) {
    setMicroficheIndex(activeIndex + delta);
}

export function getMicroficheCount() {
    return researchData.length;
}

function renderActiveCard() {
    if (!deckContainer || researchData.length === 0) return;

    const item = researchData[activeIndex];
    const total = researchData.length;
    const tagsHtml = (item.tags || []).map(tag => `<span class="microfiche-tag-chip">${tag}</span>`).join('');

    deckContainer.innerHTML = `
        <div class="microfiche-card">
            <div class="microfiche-header">
                <span class="microfiche-sector-tag">[03 // ARCHIVE]</span>
                <span class="microfiche-card-num">${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
            </div>
            
            <div class="microfiche-title">${item.title}</div>
            
            <div class="microfiche-desc">${item.desc || 'Quantum research entry recorded in relativistic catalog.'}</div>
            
            <div class="microfiche-tags">
                ${tagsHtml}
            </div>
            
            <div class="microfiche-action-hint" id="microfiche-open-doc">
                <span>📄 SWIPE UP OR TAP FOR FULL DOCS</span>
                <span>↑</span>
            </div>
        </div>
    `;

    // Tap on action hint to open docs
    const openDocTrigger = document.getElementById('microfiche-open-doc');
    if (openDocTrigger) {
        openDocTrigger.addEventListener('click', () => {
            openDocumentationReader('/klein-gordon.md', 'klein-gordon.md');
        });
    }

    // Render MathJax equations in card description
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([deckContainer]).catch(() => {});
    }
}
