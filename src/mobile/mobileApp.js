// ==========================================================================
// Spacetime Portfolio — Mobile App Coordinator (Branch: mobile2)
// Orchestrates 5 Tabs, Top Telemetry Bar, Stage Isolation & Rotary Dial Dock
// ==========================================================================

import { STATE } from '../state.js';
import { initChronoDial, setSector, SECTORS } from './chronoDial.js';
import { renderTabBio } from './pages/tabBio.js';
import { renderTabTimeline } from './pages/tabTimeline.js';
import { renderTabWorks } from './pages/tabWorks.js';
import { renderTabArsenal } from './pages/tabArsenal.js';
import { renderTabExperiments } from './pages/tabExperiments.js';

let appRoot = null;
let currentTabId = 'BIO';
let tabContainers = {};
let renderedTabs = new Set();

export function initMobileApp() {
    if (!STATE.isMobile) return;

    // Apply mobile mode class to body for clean CSS targeting
    document.body.classList.add('mobile-app-mode');

    // Setup main container
    setupAppShell();

    // Initialize Chrono Dial with our tab switch callback
    initChronoDial(handleTabSwitch);

    // Initial switch to BIO tab
    switchTab('BIO', 0);
    window.switchMobileTab = switchTab;
}

function setupAppShell() {
    let existing = document.getElementById('mobile-app-root');
    if (existing) {
        existing.remove();
    }

    appRoot = document.createElement('div');
    appRoot.id = 'mobile-app-root';
    appRoot.className = 'mobile-app-root';
    appRoot.innerHTML = `
        <!-- Top App Bar -->
        <header class="mobile-top-bar" id="mobile-top-bar">
            <div class="mobile-top-left">
                <span class="mobile-top-logo">RW</span>
                <span class="mobile-top-tab-badge" id="mobile-top-tab-name">BIO // 01</span>
            </div>
            <div class="mobile-top-right">
                <button class="mobile-cli-toggle-btn" id="mobile-btn-cli" aria-label="Toggle Command Line Terminal">
                    <span>&gt;_ CLI</span>
                </button>
            </div>
        </header>

        <!-- Tab Content Viewport -->
        <main class="mobile-tab-viewport" id="mobile-tab-viewport">
            <div class="mobile-tab-view" id="mobile-view-bio" data-tab="BIO"></div>
            <div class="mobile-tab-view" id="mobile-view-timeline" data-tab="TIMELINE" style="display:none;"></div>
            <div class="mobile-tab-view" id="mobile-view-works" data-tab="WORKS" style="display:none;"></div>
            <div class="mobile-tab-view" id="mobile-view-arsenal" data-tab="ARSENAL" style="display:none;"></div>
            <div class="mobile-tab-view" id="mobile-view-experiments" data-tab="EXPERIMENTS" style="display:none;"></div>
        </main>
    `;

    document.body.appendChild(appRoot);

    // Cache tab containers
    tabContainers = {
        'BIO': document.getElementById('mobile-view-bio'),
        'TIMELINE': document.getElementById('mobile-view-timeline'),
        'WORKS': document.getElementById('mobile-view-works'),
        'ARSENAL': document.getElementById('mobile-view-arsenal'),
        'EXPERIMENTS': document.getElementById('mobile-view-experiments')
    };

    // Hook CLI toggle
    const btnCli = document.getElementById('mobile-btn-cli');
    if (btnCli) {
        btnCli.addEventListener('click', () => {
            const terminalOverlay = document.getElementById('terminal-overlay');
            if (terminalOverlay) {
                const isOpen = terminalOverlay.classList.contains('open');
                if (isOpen) {
                    terminalOverlay.classList.remove('open');
                } else {
                    terminalOverlay.classList.add('open');
                    const terminalInput = document.getElementById('terminal-input');
                    if (terminalInput) terminalInput.focus();
                }
            }
        });
    }
}

function handleTabSwitch(tabId, tabIndex) {
    switchTab(tabId, tabIndex, false);
}

export function switchTab(tabId, tabIndex = -1, updateDial = true) {
    if (tabIndex === -1) {
        tabIndex = SECTORS.findIndex(s => s.id === tabId);
        if (tabIndex === -1) tabIndex = 0;
    }

    currentTabId = tabId;
    STATE.activeMobileTab = tabId;
    if (tabId === 'BIO') STATE.phase = 'HERO';
    else if (tabId === 'TIMELINE') STATE.phase = 'TIMELINE';
    else if (tabId === 'WORKS') STATE.phase = 'WORKS';
    else if (tabId === 'ARSENAL') STATE.phase = 'ARSENAL';
    else if (tabId === 'EXPERIMENTS') STATE.phase = 'PLAYGROUND';

    // Update Header
    const topTabName = document.getElementById('mobile-top-tab-name');
    if (topTabName) {
        const sec = SECTORS[tabIndex];
        topTabName.innerText = `${sec.label} // ${sec.code}`;
    }

    // Toggle Tab Views with absolute stage isolation
    Object.keys(tabContainers).forEach(key => {
        const el = tabContainers[key];
        if (el) {
            if (key === tabId) {
                el.style.display = 'block';
                el.scrollTop = 0;
            } else {
                el.style.display = 'none';
            }
        }
    });

    // Render Tab Content if not rendered or dynamic refresh
    const targetContainer = tabContainers[tabId];
    if (targetContainer) {
        if (tabId === 'BIO' && !renderedTabs.has('BIO')) {
            renderTabBio(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
            renderedTabs.add('BIO');
        } else if (tabId === 'TIMELINE' && !renderedTabs.has('TIMELINE')) {
            renderTabTimeline(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
            renderedTabs.add('TIMELINE');
        } else if (tabId === 'WORKS' && !renderedTabs.has('WORKS')) {
            renderTabWorks(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
            renderedTabs.add('WORKS');
        } else if (tabId === 'ARSENAL' && !renderedTabs.has('ARSENAL')) {
            renderTabArsenal(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
            renderedTabs.add('ARSENAL');
        } else if (tabId === 'EXPERIMENTS' && !renderedTabs.has('EXPERIMENTS')) {
            renderTabExperiments(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
            renderedTabs.add('EXPERIMENTS');
        }
    }

    // Sync Dial if switched programmatically
    if (updateDial) {
        setSector(tabIndex);
    }
}
