// ==========================================================================
// Spacetime Portfolio — Mobile Highlights Module (Branch: mobile2)
// Direct Touch Simulation Adapters, Floating HUD Badge, Parameter Controls
// ==========================================================================

import { showExhibit } from '../components/worksSection.js';

const EXHIBIT_META = [
    {
        title: 'MEGH // ACOUSTIC SYNTHESIS',
        badge: 'EXHIBIT 01/03',
        tag: 'SPEECH & AUDIO AI',
        desc: 'Real-time neural acoustic model and speech synthesis waveform simulator.'
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
                <button id="mobile-megh-trigger" class="mobile-ctrl-btn">
                    <span>▶</span>
                    <span>TRIGGER AUDIO</span>
                </button>
                <button id="mobile-exhibit-info-btn" class="mobile-ctrl-btn">
                    <span>ⓘ</span>
                    <span>INFO</span>
                </button>
            `;
            const audioBtn = document.getElementById('mobile-megh-trigger');
            if (audioBtn) {
                audioBtn.addEventListener('click', () => {
                    const desktopPlay = document.querySelector('.play-btn, #audio-play-btn');
                    if (desktopPlay) desktopPlay.click();
                });
            }
        } else if (index === 1) {
            // GeoFNO
            controlsBarEl.innerHTML = `
                <span style="font-size: 10px; color: #00ffff; letter-spacing: 1px;">TOUCH DRAG TO ROTATE 3D GLOBE</span>
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
