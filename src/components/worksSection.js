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

let prevBtn, nextBtn, thumbPrev, thumbNext, toResearchBtn;

export function initWorksCarousel() {
    prevBtn = document.getElementById('works-prev');
    nextBtn = document.getElementById('works-next');
    thumbPrev = document.getElementById('thumb-prev');
    thumbNext = document.getElementById('thumb-next');
    toResearchBtn = document.getElementById('works-to-research');

    if (prevBtn) prevBtn.addEventListener('click', prevExhibit);
    if (nextBtn) nextBtn.addEventListener('click', nextExhibit);
    if (toResearchBtn) toResearchBtn.addEventListener('click', () => {
        // Import and call transition
        import('../core/transitions.js').then(mod => {
            if (mod.initiateWorksToResearch) mod.initiateWorksToResearch();
        });
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
        // Re-enable carousel pointer events for Megh
        if (carousel) carousel.style.pointerEvents = 'auto';
    } else if (index === 1) {
        // GeoFNO: uses geofno-container — add a transparent overlay to capture
        // OrbitControls mouse events so they don't leak, but keep carousel
        // arrows clickable by placing the overlay INSIDE the carousel but
        // NOT covering the arrow buttons.
        if (geofnoContainer) {
            geofnoContainer.style.display = 'block';
        }
        // Instead of disabling carousel pointer-events entirely, add a
        // transparent overlay div that sits under the arrow buttons.
        // The overlay covers the center area for 3D interaction.
        if (carousel) {
            const overlay = document.createElement('div');
            overlay.id = 'works-3d-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                pointer-events: auto;
            `;
            carousel.appendChild(overlay);
        }
    } else if (index === 2) {
        // Ising: uses ising-container — same overlay approach
        if (isingContainer) {
            isingContainer.style.display = 'block';
        }
        if (carousel) {
            const overlay = document.createElement('div');
            overlay.id = 'works-3d-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                pointer-events: auto;
            `;
            carousel.appendChild(overlay);
        }
    }

    // Init new
    const exhibit = EXHIBITS[index];
    if (exhibit.init) exhibit.init();

    // Update UI
    updateCarouselUI();

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
    // Update thumbnails
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