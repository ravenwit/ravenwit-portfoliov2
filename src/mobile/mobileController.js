// ==========================================================================
// Spacetime Portfolio — Mobile Controller Orchestrator (Branch: mobile2)
// Delegates to unified Mobile App Coordinator with 5-page tab & dial dock
// ==========================================================================

import { STATE } from '../state.js';
import { initMobileApp, switchTab } from './mobileApp.js';
import { setSector } from './chronoDial.js';

export function initMobileController() {
    if (!STATE.isMobile) return;
    initMobileApp();
}

export function syncMobileSector(sectorId) {
    if (!STATE.isMobile) return;
    if (sectorId === 'HERO' && STATE.activeMobileTab !== 'BIO') switchTab('BIO', 0);
    else if (sectorId === 'TIMELINE' && STATE.activeMobileTab !== 'TIMELINE') switchTab('TIMELINE', 1);
    else if (sectorId === 'WORKS' && STATE.activeMobileTab !== 'WORKS') switchTab('WORKS', 2);
    else if (sectorId === 'RESEARCH' && STATE.activeMobileTab !== 'WORKS') switchTab('WORKS', 2);
    else if (sectorId === 'PLAYGROUND' && STATE.activeMobileTab !== 'EXPERIMENTS') switchTab('EXPERIMENTS', 4);
}

export { switchTab, setSector };
