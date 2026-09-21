// ==========================================================================
// Spacetime Portfolio — Mobile Controller Orchestrator (Branch: mobile2)
// Coordinates Relativistic Chrono-Dial, Stage Switching, Drawers & Exhibits
// ==========================================================================

import { STATE } from '../state.js';
import { CAREER_NODES } from '../config.js';
import { navigateToSector } from '../core/transitions.js';
import { jumpToMilestone } from '../core/scroll.js';
import { initChronoDial, updateChronoTelemetry, setSector } from './chronoDial.js';
import { initMobileDrawer, openArsenalDrawer } from './mobileDrawer.js';
import { initMobileHighlights, setMobileExhibit } from './mobileHighlights.js';
import { initMicroficheDeck, setMicroficheIndex, getMicroficheCount } from './microficheDeck.js';

let mobileNodeCard = null;
let activeMilestoneIndex = 0;

export function initMobileController() {
    if (!STATE.isMobile) return;

    // 1. Initialize Sub-modules
    initChronoDial(handleSectorChange, handleMicroScrub);
    initMobileDrawer(handleDrawerStateChange);
    initMobileHighlights();
    initMicroficheDeck(handleCardChange);

    // 2. Setup Mobile Origin Social Strip
    setupOriginSocials();

    // 3. Setup Mobile Timeline Stage & Arsenal Pill
    setupTimelineMobileStage();

    // 4. Initial Sync with Hero
    handleSectorChange('HERO', 0);
}

function setupOriginSocials() {
    const heroEl = document.getElementById('ui-hero');
    if (!heroEl || document.getElementById('mobile-social-strip')) return;

    const socialStrip = document.createElement('div');
    socialStrip.id = 'mobile-social-strip';
    socialStrip.className = 'mobile-social-strip';
    socialStrip.innerHTML = `
        <a href="https://github.com/ravenwit" target="_blank" rel="noopener" class="mobile-social-btn" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a>
        <a href="https://linkedin.com/in/ravenwit" target="_blank" rel="noopener" class="mobile-social-btn" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
        </a>
        <a href="mailto:shakir@ravenwit.com" class="mobile-social-btn" aria-label="Email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </a>
    `;
    heroEl.appendChild(socialStrip);
}

function setupTimelineMobileStage() {
    // Floating Arsenal Trigger Pill
    if (!document.getElementById('mobile-arsenal-trigger')) {
        const pill = document.createElement('button');
        pill.id = 'mobile-arsenal-trigger';
        pill.className = 'mobile-arsenal-trigger-pill';
        pill.setAttribute('aria-label', 'Open Arsenal Skill Matrix');
        pill.style.display = 'none';
        pill.innerHTML = `
            <span class="chrono-pulse-dot"></span>
            <span>[+] ARSENAL MATRIX :: 121 SKILLS</span>
        `;
        pill.addEventListener('click', () => {
            openArsenalDrawer();
        });
        document.body.appendChild(pill);
    }

    // Milestone Card Container
    if (!document.getElementById('mobile-node-card')) {
        mobileNodeCard = document.createElement('div');
        mobileNodeCard.id = 'mobile-node-card';
        mobileNodeCard.className = 'mobile-node-card-wrapper';
        mobileNodeCard.style.display = 'none';
        document.body.appendChild(mobileNodeCard);
    } else {
        mobileNodeCard = document.getElementById('mobile-node-card');
    }
}

// --------------------------------------------------------------------------
// SECTOR & SCRUB EVENT HANDLERS
// --------------------------------------------------------------------------
export function syncMobileSector(sectorId) {
    STATE.activeMobileSector = sectorId;

    // Toggle 4 Sector Stage Containers for 100% Visual Isolation
    const heroEl = document.getElementById('ui-hero');
    if (heroEl) {
        heroEl.style.display = sectorId === 'HERO' ? 'flex' : 'none';
        heroEl.style.opacity = sectorId === 'HERO' ? '1' : '0';
        heroEl.style.pointerEvents = sectorId === 'HERO' ? 'auto' : 'none';
    }

    const hobbiesLayer = document.getElementById('hobbies-ui-layer');
    if (hobbiesLayer) {
        hobbiesLayer.style.display = sectorId === 'TIMELINE' ? 'block' : 'none';
        hobbiesLayer.style.opacity = sectorId === 'TIMELINE' ? '1' : '0';
        hobbiesLayer.style.pointerEvents = sectorId === 'TIMELINE' ? 'auto' : 'none';
    }

    const worksEl = document.getElementById('ui-works');
    if (worksEl) {
        worksEl.style.display = sectorId === 'WORKS' ? 'block' : 'none';
        worksEl.style.opacity = sectorId === 'WORKS' ? '1' : '0';
        worksEl.style.pointerEvents = sectorId === 'WORKS' ? 'auto' : 'none';
    }

    const researchEl = document.getElementById('ui-research');
    if (researchEl) {
        researchEl.style.display = sectorId === 'RESEARCH' ? 'block' : 'none';
        researchEl.style.opacity = sectorId === 'RESEARCH' ? '1' : '0';
        researchEl.style.pointerEvents = sectorId === 'RESEARCH' ? 'auto' : 'none';
    }

    // Toggle Mobile Elements Visibility
    const arsenalPill = document.getElementById('mobile-arsenal-trigger');
    if (arsenalPill) {
        arsenalPill.style.display = sectorId === 'TIMELINE' ? 'flex' : 'none';
    }

    if (mobileNodeCard) {
        mobileNodeCard.style.display = sectorId === 'TIMELINE' ? 'flex' : 'none';
    }

    const highlightBadge = document.getElementById('mobile-highlight-badge');
    if (highlightBadge) {
        highlightBadge.style.display = sectorId === 'WORKS' ? 'flex' : 'none';
    }

    const highlightControls = document.getElementById('mobile-highlight-controls');
    if (highlightControls) {
        highlightControls.style.display = sectorId === 'WORKS' ? 'flex' : 'none';
    }

    const microfiche = document.getElementById('microfiche-deck-container');
    if (microfiche) {
        microfiche.style.display = sectorId === 'RESEARCH' ? 'flex' : 'none';
    }

    // Initial sector configuration
    if (sectorId === 'TIMELINE') {
        renderMilestoneCard(activeMilestoneIndex || 0);
    } else if (sectorId === 'WORKS') {
        setMobileExhibit(0);
    } else if (sectorId === 'RESEARCH') {
        setMicroficheIndex(0);
    }
}

function handleSectorChange(sectorId, sectorIndex) {
    syncMobileSector(sectorId);

    // If still in loading screen, wait for ready before calling unified router
    if (STATE.phase === 'LOADING') {
        const checkReady = setInterval(() => {
            if (STATE.phase !== 'LOADING') {
                clearInterval(checkReady);
                navigateToSector(sectorId);
                if (sectorId === 'TIMELINE') {
                    jumpToMilestone(0, 0.4);
                }
            }
        }, 50);
        return;
    }

    // Call unified router
    navigateToSector(sectorId);

    if (sectorId === 'TIMELINE') {
        jumpToMilestone(0, 0.4);
    }
}

function handleMicroScrub(sectorId, normVal) {
    if (sectorId === 'TIMELINE') {
        const total = CAREER_NODES.length;
        if (total === 0) return;

        const targetIdx = Math.max(0, Math.min(total - 1, Math.floor(normVal * total)));
        if (targetIdx !== activeMilestoneIndex) {
            activeMilestoneIndex = targetIdx;
            renderMilestoneCard(activeMilestoneIndex);
            jumpToMilestone(activeMilestoneIndex, 0.25);
        }

        // Relativistic Telemetry Calculation
        const node = CAREER_NODES[activeMilestoneIndex];
        const rawYear = node?.time_range?.start || node?.date || '2011';
        const year = parseFloat(rawYear) || 2011;
        const t = Math.max(0, year - 2011.0);
        const gamma = 1.15; // Lorentz factor for sub-luminal flight
        const tau = t / gamma;
        updateChronoTelemetry(t, tau);

    } else if (sectorId === 'WORKS') {
        // 3 Exhibits
        const exhibitIdx = Math.max(0, Math.min(2, Math.floor(normVal * 3)));
        setMobileExhibit(exhibitIdx);

    } else if (sectorId === 'RESEARCH') {
        // Microfiche cards
        const total = getMicroficheCount();
        if (total === 0) return;
        const cardIdx = Math.max(0, Math.min(total - 1, Math.floor(normVal * total)));
        setMicroficheIndex(cardIdx);
    }
}

function renderMilestoneCard(index) {
    if (!mobileNodeCard || !CAREER_NODES[index]) return;
    const node = CAREER_NODES[index];
    const total = CAREER_NODES.length;

    const yearDisplay = node.time_range
        ? `${node.time_range.start} – ${node.time_range.end || 'PRESENT'}`
        : (node.date || '2011');

    const descText = Array.isArray(node.responsibilities) && node.responsibilities.length > 0
        ? node.responsibilities.slice(0, 2).map(r => `• ${r}`).join('<br>')
        : (node.desc || node.details || 'Spacetime trajectory node recorded in relativistic log.');

    const skillsBadges = Array.isArray(node.skills) && node.skills.length > 0
        ? `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
            ${node.skills.slice(0, 4).map(s => `<span style="font-size:9px; background:rgba(0,255,255,0.1); border:1px solid rgba(0,255,255,0.3); padding:2px 6px; border-radius:3px; color:#00ffaa;">${s}</span>`).join('')}
           </div>`
        : '';

    mobileNodeCard.innerHTML = `
        <div class="mobile-node-card-badge">
            <span>MILESTONE ${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}</span>
            <span style="color:#00ffaa; font-weight:700;">${yearDisplay}</span>
        </div>
        <div class="mobile-node-card-title">${node.title}</div>
        <div class="mobile-node-card-role">${node.subtitle || node.location || 'RESEARCHER / ENGINEER'}</div>
        <div class="mobile-node-card-desc">${descText}</div>
        ${skillsBadges}
    `;
}

function handleCardChange(index) {
    // Synchronize telemetry with card index
    const total = getMicroficheCount();
    const t = (index / Math.max(1, total - 1)) * 14.0;
    const tau = t * 0.87;
    updateChronoTelemetry(t, tau);
}

function handleDrawerStateChange(isOpen) {
    STATE.isDrawerOpen = isOpen;
    // Power gating: render loops check STATE.isDrawerOpen
}
