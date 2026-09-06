// --- Works Section — Carousel Exhibit Manager ---
// Manages 3 exhibits: Megh, GeoFNO, Ising.
// Exposes showExhibit, nextExhibit, prevExhibit, destroyCurrentExhibit.

import { STATE } from '../state.js';
import { initMeghExhibit, destroyMeghExhibit } from './exhibitMegh.js';
import { initGeofnoExhibit, destroyGeofnoExhibit } from './exhibitGeofno.js';
import { initIsingExhibit, destroyIsingExhibit } from './exhibitIsing.js';

let currentExhibitIndex = -1;

const EXHIBITS = [
    { id: 'megh', name: 'Megh', thumbnail: '☁️', init: initMeghExhibit, destroy: destroyMeghExhibit },
    { id: 'geofno', name: 'Geo-FNO', thumbnail: '⍟', init: initGeofnoExhibit, destroy: destroyGeofnoExhibit },
    { id: 'ising', name: 'Ising Model', thumbnail: '⬡', init: initIsingExhibit, destroy: destroyIsingExhibit },
];

let prevBtn, nextBtn, ladderPrevBtn, ladderNextBtn, thumbPrev, thumbNext, toResearchBtn;

export function initWorksCarousel() {
    prevBtn = document.getElementById('works-prev');
    nextBtn = document.getElementById('works-next');
    ladderPrevBtn = document.getElementById('works-ladder-prev');
    ladderNextBtn = document.getElementById('works-ladder-next');
    thumbPrev = document.getElementById('thumb-prev');
    thumbNext = document.getElementById('thumb-next');
    toResearchBtn = document.getElementById('works-to-research');

    if (prevBtn) prevBtn.addEventListener('click', prevExhibit);
    if (nextBtn) nextBtn.addEventListener('click', nextExhibit);
    if (ladderPrevBtn) ladderPrevBtn.addEventListener('click', prevExhibit);
    if (ladderNextBtn) ladderNextBtn.addEventListener('click', nextExhibit);

    // Ladder direct node selection
    document.querySelectorAll('.ladder-node').forEach(node => {
        node.addEventListener('click', () => {
            const idx = parseInt(node.dataset.index, 10);
            if (!isNaN(idx)) showExhibit(idx);
        });
    });

    if (toResearchBtn) toResearchBtn.addEventListener('click', () => {
        import('../core/transitions.js').then(mod => {
            if (mod.navigateToSector) mod.navigateToSector('RESEARCH');
        });
    });

    // Keyboard navigation within WORKS phase
    window.addEventListener('keydown', (e) => {
        if (STATE.phase !== 'WORKS' || STATE.transitioning) return;
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            prevExhibit();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            nextExhibit();
        }
    });
}

export function showExhibit(index) {
    if (index < 0 || index >= EXHIBITS.length) return;
    
    // Destroy current
    if (currentExhibitIndex >= 0) {
        const current = EXHIBITS[currentExhibitIndex];
        if (current.destroy) current.destroy();
    }

    currentExhibitIndex = index;
    STATE.worksExhibitIndex = index;

    // Manage container visibility to prevent z-index conflicts
    const exhibitContainer = document.getElementById('works-exhibit-container');
    const geofnoContainer = document.getElementById('geofno-container');
    const isingContainer = document.getElementById('ising-container');
    const carousel = document.getElementById('works-carousel');

    // Hide all containers first
    if (exhibitContainer) exhibitContainer.style.display = 'none';
    if (geofnoContainer) geofnoContainer.style.display = 'none';
    if (isingContainer) isingContainer.style.display = 'none';

    // Remove any existing 3D overlay from previous GeoFNO/Ising exhibits
    const existingOverlay = document.getElementById('works-3d-overlay');
    if (existingOverlay) existingOverlay.remove();

    if (index === 0) {
        // Megh: uses works-exhibit-container (inside carousel)
        if (exhibitContainer) exhibitContainer.style.display = 'block';
        if (carousel) carousel.style.pointerEvents = 'auto';
    } else if (index === 1) {
        // GeoFNO: uses geofno-container (sibling, z-index 1)
        if (geofnoContainer) {
            geofnoContainer.style.display = 'block';
        }
        if (carousel) carousel.style.pointerEvents = 'none'; // allow clicks to pass through to geofno-container
    } else if (index === 2) {
        // Ising: uses ising-container (sibling, z-index 1)
        if (isingContainer) {
            isingContainer.style.display = 'block';
        }
        if (carousel) carousel.style.pointerEvents = 'none'; // allow clicks to pass through to ising-container
    }

    // Init new
    const exhibit = EXHIBITS[index];
    if (exhibit.init) exhibit.init();

    // Update UI
    updateCarouselUI();

    // Live Dock Integration: sync dock telemetry with active exhibit
    const EXHIBIT_TAGS = [
        '02 HIGHLIGHTS // EXHIBIT 01: MEGH VAULT',
        '02 HIGHLIGHTS // EXHIBIT 02: GEO-FNO TORUS',
        '02 HIGHLIGHTS // EXHIBIT 03: ISING LATTICE'
    ];
    const sectorEl = document.getElementById('dock-active-sector-id');
    if (sectorEl && EXHIBIT_TAGS[index]) {
        sectorEl.textContent = EXHIBIT_TAGS[index];
    }

    // Show/hide "View More Projects" button (shown only on last exhibit)
    if (toResearchBtn) {
        toResearchBtn.style.display = (index === EXHIBITS.length - 1) ? 'inline-block' : 'none';
    }
}

export function nextExhibit() {
    if (currentExhibitIndex < EXHIBITS.length - 1) {
        showExhibit(currentExhibitIndex + 1);
    }
}

export function prevExhibit() {
    if (currentExhibitIndex > 0) {
        showExhibit(currentExhibitIndex - 1);
    }
}

function updateCarouselUI() {
    // Update ladder active classes
    document.querySelectorAll('.ladder-node').forEach((node, i) => {
        if (i === currentExhibitIndex) {
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
    });

    // Disable/enable ladder buttons
    if (ladderPrevBtn) ladderPrevBtn.disabled = currentExhibitIndex <= 0;
    if (ladderNextBtn) ladderNextBtn.disabled = currentExhibitIndex >= EXHIBITS.length - 1;

    // Update thumbnails (fallback for bottom arrows)
    if (thumbPrev) {
        if (currentExhibitIndex > 0) {
            thumbPrev.textContent = EXHIBITS[currentExhibitIndex - 1].thumbnail;
            thumbPrev.style.opacity = '1';
        } else {
            thumbPrev.style.opacity = '0.3';
        }
    }

    if (thumbNext) {
        if (currentExhibitIndex < EXHIBITS.length - 1) {
            thumbNext.textContent = EXHIBITS[currentExhibitIndex + 1].thumbnail;
            thumbNext.style.opacity = '1';
        } else {
            thumbNext.style.opacity = '0.3';
        }
    }

    // Disable/enable buttons
    if (prevBtn) prevBtn.disabled = currentExhibitIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentExhibitIndex >= EXHIBITS.length - 1;
}

export function destroyCurrentExhibit() {
    if (currentExhibitIndex >= 0) {
        const current = EXHIBITS[currentExhibitIndex];
        if (current.destroy) current.destroy();
        currentExhibitIndex = -1;
    }
    // Clean up overlay
    const overlay = document.getElementById('works-3d-overlay');
    if (overlay) overlay.remove();
}