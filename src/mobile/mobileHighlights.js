// ==========================================================================
// Spacetime Portfolio — Mobile Highlights Module (Branch: mobile2)
// Direct Touch Simulation Adapters, Floating HUD Badge, Parameter Controls
// ==========================================================================

import { showExhibit } from '../components/worksSection.js';

const EXHIBIT_META = [
    {
        title: 'MEGH // CLOUD STORAGE VAULT',
        badge: 'EXHIBIT 01/03',
        tag: 'CLOUD CRYPTOGRAPHY',
        desc: 'Zero-knowledge multi-cloud aggregator pooling 52GB across 5 free tiers.'
    },
    {
        title: 'GEO-FNO // ATMOSPHERIC OPERATOR',
        badge: 'EXHIBIT 02/03',
        tag: 'PDE OPERATOR LEARNING',
        desc: 'Fourier Neural Operator on spherical geometry predicting atmospheric fluid flow dynamics.'
    },
    {
        title: 'ISING // THERMODYNAMIC LATTICE',
        badge: 'EXHIBIT 03/03',
        tag: 'STATISTICAL MECHANICS',
        desc: '2D Ising model simulation with Glauber dynamics and critical temperature phase transition.'
    }
];

let activeExhibitIdx = 0;
let topBadgeEl = null;
let controlsBarEl = null;

export function initMobileHighlights() {
    const worksLayer = document.getElementById('ui-works');
    if (!worksLayer) return;

    // Create top floating badge
    if (!document.getElementById('mobile-highlight-badge')) {
        topBadgeEl = document.createElement('div');
        topBadgeEl.id = 'mobile-highlight-badge';
        topBadgeEl.className = 'mobile-highlight-top-badge';
        worksLayer.appendChild(topBadgeEl);
    } else {
        topBadgeEl = document.getElementById('mobile-highlight-badge');
    }

    // Create floating controls bar
    if (!document.getElementById('mobile-highlight-controls')) {
        controlsBarEl = document.createElement('div');
        controlsBarEl.id = 'mobile-highlight-controls';
        controlsBarEl.className = 'mobile-highlight-controls-bar';
        worksLayer.appendChild(controlsBarEl);
    } else {
        controlsBarEl = document.getElementById('mobile-highlight-controls');
    }
}

export function setMobileExhibit(index) {
    if (index < 0 || index >= EXHIBIT_META.length) return;
    activeExhibitIdx = index;

    // Trigger existing works carousel logic
    showExhibit(index);

    const meta = EXHIBIT_META[index];

    // Update top badge
    if (topBadgeEl) {
        topBadgeEl.innerHTML = `
            <span class="chrono-pulse-dot"></span>
            <strong>${meta.badge}</strong>
            <span>//</span>
            <span>${meta.title}</span>
        `;
    }

    // Update bottom parameter controls bar
    if (controlsBarEl) {
        if (index === 0) {
            // Megh
            controlsBarEl.innerHTML = `
                <a href="https://megh-vault.vercel.app" target="_blank" rel="noopener" class="mobile-ctrl-btn" style="text-decoration:none;">
                    <span>↗</span>
                    <span>VISIT VAULT</span>
                </a>
                <button id="mobile-exhibit-info-btn" class="mobile-ctrl-btn">
                    <span>ⓘ</span>
                    <span>INFO</span>
                </button>
            `;
        } else if (index === 1) {
            // GeoFNO
            controlsBarEl.innerHTML = `
                <span style="font-size: 10px; color: var(--mobile-quantum); letter-spacing: 0.05em; font-family: var(--mobile-font-mono);">TOUCH DRAG TO ROTATE 3D GLOBE</span>
                <button id="mobile-exhibit-info-btn" class="mobile-ctrl-btn">
                    <span>ⓘ</span>
                    <span>INFO</span>
                </button>
            `;
        } else if (index === 2) {
            // Ising
            controlsBarEl.innerHTML = `
                <div class="mobile-slider-wrap">
                    <span>TEMP T:</span>
                    <input type="range" id="mobile-ising-slider" class="mobile-param-slider" min="1.0" max="4.0" step="0.1" value="2.27"/>
                </div>
                <button id="mobile-exhibit-info-btn" class="mobile-ctrl-btn">
                    <span>ⓘ</span>
                    <span>INFO</span>
                </button>
            `;
            const slider = document.getElementById('mobile-ising-slider');
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    const desktopSlider = document.getElementById('temp-slider') || document.querySelector('input[type="range"]');
                    if (desktopSlider) {
                        desktopSlider.value = val;
                        desktopSlider.dispatchEvent(new Event('input'));
                    }
                });
            }
        }

        // Bind info button
        const infoBtn = document.getElementById('mobile-exhibit-info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => {
                alert(`${meta.title}\n\nDomain: ${meta.tag}\n\n${meta.desc}`);
            });
        }
    }
}
