// ==========================================================================
// Spacetime Portfolio — Mobile App Coordinator (Branch: mobile-sleek-ui-elevation)
// Orchestrates 5 Tabs, Horizontal 1:1 Geared Swipe Track, Animated Splash & Dock
// ==========================================================================

import { STATE } from '../state.js';
import { initChronoDial, setSector, setLiveSwipeNorm, triggerHaptic, SECTORS } from './chronoDial.js';
import { renderTabBio } from './pages/tabBio.js';
import { renderTabTimeline } from './pages/tabTimeline.js';
import { renderTabWorks } from './pages/tabWorks.js';
import { renderTabArsenal } from './pages/tabArsenal.js';
import { renderTabExperiments } from './pages/tabExperiments.js';

let appRoot = null;
let trackEl = null;
let currentTabId = 'BIO';
let currentTabIndex = 0;
let tabContainers = {};
let renderedTabs = new Set();

// Horizontal 1:1 Swipe kinematics state
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isSwiping = false;
let gestureLocked = null; // null | 'horizontal' | 'vertical'
let currentDeltaX = 0;

export function initMobileApp() {
    if (!STATE.isMobile) return;

    // Apply mobile mode class to body for clean CSS targeting
    document.body.classList.add('mobile-app-mode');

    // Show Animated SVG Splash Screen on boot
    showMobileSplashScreen();

    // Setup main container
    setupAppShell();

    // Initialize Chrono Dial with our tab switch callback
    initChronoDial(handleTabSwitch);

    // Setup 1:1 Geared Swipe Gestures
    setupSwipeGestures();

    // Initial switch to HOME tab
    switchTab('BIO', 0);
    window.switchMobileTab = switchTab;
}

function showMobileSplashScreen() {
    if (sessionStorage.getItem('mobile_splash_shown')) return;
    sessionStorage.setItem('mobile_splash_shown', '1');

    const splash = document.createElement('div');
    splash.id = 'mobile-splash-screen';
    splash.className = 'mobile-splash-screen';
    splash.innerHTML = `
        <div class="splash-logo-container">
            <svg id="logo-anim" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
                <style>
                    #logo-anim-s-path1_tr {animation: logo-anim-s-path1_tr__tr 2200ms cubic-bezier(0.16, 1, 0.3, 1) 1 normal forwards}
                    @keyframes logo-anim-s-path1_tr__tr { 0% {transform: translate(205.470405px,106.641158px) rotate(-360deg)} 40% {transform: translate(205.470405px,106.641158px) rotate(0deg)} 100% {transform: translate(205.470405px,106.641158px) rotate(0deg)}}
                    #logo-anim-s-path2_ts {animation: logo-anim-s-path2_ts__ts 2200ms cubic-bezier(0.16, 1, 0.3, 1) 1 normal forwards}
                    @keyframes logo-anim-s-path2_ts__ts { 0% {transform: translate(332.586349px,373.542641px) scale(0,0)} 30% {transform: translate(332.586349px,373.542641px) scale(0,0)} 65% {transform: translate(332.586349px,373.542641px) scale(1,1)} 100% {transform: translate(332.586349px,373.542641px) scale(1,1)}}
                    #logo-anim-s-path3_tr {animation: logo-anim-s-path3_tr__tr 2200ms cubic-bezier(0.16, 1, 0.3, 1) 1 normal forwards}
                    @keyframes logo-anim-s-path3_tr__tr { 0% {transform: translate(245.747093px,227.421394px) rotate(-360deg)} 15% {transform: translate(245.747093px,227.421394px) rotate(-360deg)} 50% {transform: translate(245.747093px,227.421394px) rotate(0deg)} 100% {transform: translate(245.747093px,227.421394px) rotate(0deg)}}
                    #logo-anim-s-path3_ts {animation: logo-anim-s-path3_ts__ts 2200ms cubic-bezier(0.16, 1, 0.3, 1) 1 normal forwards}
                    @keyframes logo-anim-s-path3_ts__ts { 0% {transform: scale(0,0)} 15% {transform: scale(0,0)} 50% {transform: scale(1,1)} 100% {transform: scale(1,1)}}
                    #logo-anim-s-path4_ts {animation: logo-anim-s-path4_ts__ts 2200ms cubic-bezier(0.16, 1, 0.3, 1) 1 normal forwards}
                    @keyframes logo-anim-s-path4_ts__ts { 0% {transform: translate(101px,304.500168px) scale(0,0)} 35% {transform: translate(101px,304.500168px) scale(0,0)} 65% {transform: translate(101px,304.500168px) scale(1,1)} 100% {transform: translate(101px,304.500168px) scale(1,1)}}
                </style>
                <g id="logo-anim-s-path1_tr" transform="translate(205.470405,106.641158) rotate(-360)"><path id="logo-anim-s-path1" d="M74.8299,128.568c-.6612-.339-.7507-1.245-.1665-1.685L205.599,28.2135c.129-.0975.281-.1616.442-.1865L338.648,7.53487c.993-.1535,1.589,1.09008.836,1.7441L216.429,116.112c-.486.422-.438,1.194.098,1.57l94.007,65.999c.709.497.516,1.584-.317,1.783l-84.705,20.269c-.233.056-.481.025-.697-.086L74.8299,128.568Z" transform="translate(-207.049188,-106.641158)" fill="#6fdcf7"/></g>
                <g id="logo-anim-s-path2_ts" transform="translate(332.586349,373.542641) scale(0,0)"><path id="logo-anim-s-path2" d="M295.542,246.481c.194-.859,1.321-1.076,1.808-.348l88.124,131.506c.104.155.162.337.168.524l3.529,122.191c.029,1.016-1.302,1.432-1.846.577L303.868,369.628l-15.913-27.027c-.069-.117-.161-.218-.271-.298l-11.275-8.197c-.32-.233-.471-.634-.383-1.023l19.516-86.602Z" transform="translate(-332.586349,-373.542641)" fill="#4369EE"/></g>
                <g id="logo-anim-s-path3_tr" transform="translate(245.747093,227.421394) rotate(-360)"><g id="logo-anim-s-path3_ts" transform="scale(0,0)"><path id="logo-anim-s-path3" d="M399.047,325.569c.379.62-.095,1.424-.87,1.475L216.314,339.147c-.163.011-.325-.014-.472-.074L92.9034,289.198c-.9293-.377-.71-1.682.3103-1.846L260.414,260.467c.709-.113,1.119-.826.782-1.403-3.519-6.023-20.578-34.095-45.13-56.084-24.96-22.356-26.018-76.063-25.988-86.314.003-.755.886-1.218,1.562-.836l120.383,67.945c.142.08.259.192.341.326l86.683,141.468Z" transform="translate(-245.747093,-227.421394)" fill="#3d5af1"/></g></g>
                <g id="logo-anim-s-path4_ts" transform="translate(101,304.500168) scale(0,0)"><path id="logo-anim-s-path4" d="M75,128l52,27.153c0,0-8.814,324.626-16.305,325.842-7.492,1.215-11.4577-205.88-11.4577-205.88l-6.6102,12.969L75,128Z" transform="translate(-101,-304.500168)" fill="#e8b45c"/></g>
            </svg>
            <div class="splash-caption">RAVENWIT</div>
        </div>
    `;
    document.body.appendChild(splash);

    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 600);
    }, 2400);
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
        <!-- Top App Bar with Official SVG Logo -->
        <header class="mobile-top-bar" id="mobile-top-bar">
            <div class="mobile-top-left">
                <div class="mobile-top-logo-wrap">
                    <img src="/icons/logo.svg" alt="Ravenwit" class="mobile-top-logo-img" />
                </div>
                <span class="mobile-top-tab-badge" id="mobile-top-tab-name">HOME // 01</span>
            </div>
            <div class="mobile-top-right">
                <div class="mobile-top-status-indicator">
                    <span class="chrono-pulse-dot"></span>
                    <span class="mobile-status-text">ONLINE</span>
                </div>
            </div>
        </header>

        <!-- Tab Content Viewport with 1:1 Multi-Tab Sliding Track -->
        <main class="mobile-tab-viewport" id="mobile-tab-viewport">
            <div class="mobile-tab-track" id="mobile-tab-track">
                <div class="mobile-tab-view" id="mobile-view-bio" data-tab="BIO"></div>
                <div class="mobile-tab-view" id="mobile-view-timeline" data-tab="TIMELINE"></div>
                <div class="mobile-tab-view" id="mobile-view-works" data-tab="WORKS"></div>
                <div class="mobile-tab-view" id="mobile-view-arsenal" data-tab="ARSENAL"></div>
                <div class="mobile-tab-view" id="mobile-view-experiments" data-tab="EXPERIMENTS"></div>
            </div>
        </main>

        <!-- Viewport-Docked Arsenal Skill Inspector (Mounted outside transformed track) -->
        <div class="mobile-arsenal-inspector-sheet" id="arsenal-inspector" style="display: none;">
            <div class="inspector-sheet-handle"></div>
            <div class="inspector-header">
                <div class="inspector-badge">NODE TELEMETRY</div>
                <button class="inspector-close-btn" id="inspector-close-btn" aria-label="Close Inspector">✕</button>
            </div>
            <div class="inspector-body">
                <div class="inspector-icon-wrap" id="inspector-icon-wrap"></div>
                <div class="inspector-content">
                    <div class="inspector-title" id="inspector-skill-title">Select a node</div>
                    <div class="inspector-desc" id="inspector-skill-desc">Domain & timeframe</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(appRoot);

    trackEl = document.getElementById('mobile-tab-track');

    // Cache tab containers
    tabContainers = {
        'BIO': document.getElementById('mobile-view-bio'),
        'TIMELINE': document.getElementById('mobile-view-timeline'),
        'WORKS': document.getElementById('mobile-view-works'),
        'ARSENAL': document.getElementById('mobile-view-arsenal'),
        'EXPERIMENTS': document.getElementById('mobile-view-experiments')
    };
}

function setupSwipeGestures() {
    const viewport = document.getElementById('mobile-tab-viewport');
    if (!viewport) return;

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });
}

function onTouchStart(e) {
    if (e.touches.length !== 1) return;

    // Poka-Yoke: ignore touch if inside interactive components
    const target = e.target;
    if (target.closest('input, textarea, button, .scrollable, .mobile-filter-chips, canvas, #mobile-archive-drawer, .interactive-touch-zone')) {
        gestureLocked = 'vertical';
        return;
    }

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = performance.now();
    gestureLocked = null;
    isSwiping = false;
    currentDeltaX = 0;
}

function onTouchMove(e) {
    if (e.touches.length !== 1 || gestureLocked === 'vertical') return;

    const curX = e.touches[0].clientX;
    const curY = e.touches[0].clientY;
    const dx = curX - touchStartX;
    const dy = curY - touchStartY;

    if (gestureLocked === null) {
        if (Math.hypot(dx, dy) < 7) return; // Deadzone threshold

        // Directional Lock: 1.2x ratio to differentiate deliberate horizontal swipe from vertical scroll
        if (Math.abs(dx) > Math.abs(dy) * 1.2) {
            gestureLocked = 'horizontal';
            isSwiping = true;
            if (trackEl) {
                trackEl.style.transition = 'none'; // Instant 1:1 finger tracking
            }
        } else {
            gestureLocked = 'vertical';
            return;
        }
    }

    if (gestureLocked === 'horizontal') {
        if (e.cancelable) e.preventDefault(); // Stop native page rubber-banding

        // Rubber-band resistance at track boundaries (tabs 0 and 4)
        let effectiveDx = dx;
        if (currentTabIndex === 0 && dx > 0) {
            effectiveDx = dx / (1 + dx / 150);
        } else if (currentTabIndex === 4 && dx < 0) {
            effectiveDx = dx / (1 + (-dx) / 150);
        }
        currentDeltaX = effectiveDx;

        // Translate multi-tab track 1:1 with finger
        if (trackEl) {
            trackEl.style.transform = `translateX(calc(-${currentTabIndex * 20}% + ${effectiveDx}px))`;
        }

        // Synchronize Rotary Chrono-Dial in real time
        const viewportW = (appRoot && appRoot.clientWidth) || window.innerWidth || 390;
        const normOffset = -effectiveDx / (viewportW * 4);
        const liveNorm = (currentTabIndex / 4) + normOffset;
        setLiveSwipeNorm(liveNorm);
    }
}

function onTouchEnd(e) {
    if (!isSwiping || gestureLocked !== 'horizontal') {
        gestureLocked = null;
        isSwiping = false;
        return;
    }

    isSwiping = false;
    gestureLocked = null;

    const dt = Math.max(performance.now() - touchStartTime, 16);
    const vx = currentDeltaX / dt; // px/ms
    const viewportW = (appRoot && appRoot.clientWidth) || window.innerWidth || 390;
    const swipeThreshold = viewportW * 0.22;

    let targetIdx = currentTabIndex;
    if (currentDeltaX < -swipeThreshold || vx < -0.32) {
        targetIdx = Math.min(4, currentTabIndex + 1);
    } else if (currentDeltaX > swipeThreshold || vx > 0.32) {
        targetIdx = Math.max(0, currentTabIndex - 1);
    }

    // Animate track to final slot with spring easing
    if (trackEl) {
        trackEl.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
        trackEl.style.transform = `translateX(-${targetIdx * 20}%)`;
    }

    if (targetIdx !== currentTabIndex) {
        triggerHaptic(16);
        switchTab(SECTORS[targetIdx].id, targetIdx, true);
    } else {
        triggerHaptic(8);
        setLiveSwipeNorm(targetIdx / 4);
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
    currentTabIndex = tabIndex;
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

    // Close Arsenal inspector if navigating away from Arsenal
    if (tabId !== 'ARSENAL') {
        const inspector = document.getElementById('arsenal-inspector');
        if (inspector) {
            inspector.classList.remove('visible');
            setTimeout(() => {
                if (inspector) inspector.style.display = 'none';
            }, 250);
        }
    }

    // Update track position
    if (trackEl) {
        trackEl.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
        trackEl.style.transform = `translateX(-${tabIndex * 20}%)`;
    }

    // Render Tab Content
    renderTabIfNeeded(tabId);

    // Pre-render adjacent tabs in background for zero latency on swipe
    const prevIdx = tabIndex - 1;
    const nextIdx = tabIndex + 1;
    if (prevIdx >= 0) {
        setTimeout(() => renderTabIfNeeded(SECTORS[prevIdx].id), 60);
    }
    if (nextIdx < SECTORS.length) {
        setTimeout(() => renderTabIfNeeded(SECTORS[nextIdx].id), 80);
    }

    // Sync Dial if switched programmatically (e.g. from swipe or direct link)
    if (updateDial) {
        setSector(tabIndex);
    }
}

function renderTabIfNeeded(tabId) {
    const targetContainer = tabContainers[tabId];
    if (!targetContainer || renderedTabs.has(tabId)) return;

    if (tabId === 'BIO') {
        renderTabBio(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
        renderedTabs.add('BIO');
    } else if (tabId === 'TIMELINE') {
        renderTabTimeline(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
        renderedTabs.add('TIMELINE');
    } else if (tabId === 'WORKS') {
        renderTabWorks(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
        renderedTabs.add('WORKS');
    } else if (tabId === 'ARSENAL') {
        renderTabArsenal(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
        renderedTabs.add('ARSENAL');
    } else if (tabId === 'EXPERIMENTS') {
        renderTabExperiments(targetContainer, (nextId, nextIdx) => switchTab(nextId, nextIdx, true));
        renderedTabs.add('EXPERIMENTS');
    }
}
