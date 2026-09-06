import * as THREE from 'three';
import gsap from 'gsap';
import { setScrollTargetY, jumpToMilestone } from './scroll.js';
import { CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { camera } from '../core/scene.js';
import { initResearchBG } from '../components/researchBackground.js';
import { updateResearchCards } from '../components/researchCards.js';
import { researchLights } from '../components/researchTopology.js';

let transitionDeps = null;

export function setTransitionDeps(deps) {
    transitionDeps = deps;
}

// === BLACK HOLE ZOOM — Reusable Warp Effect ===
// Used for any hero→destination transition: creates a "falling into a black hole" effect
// using the torus shader's uStretch uniform, then resolves to the target phase.
function blackHoleZoom(torusMesh, torusMat, targetPhase, onArrival) {
    if (STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const tl = gsap.timeline({
        onComplete: () => {
            STATE.phase = targetPhase;
            STATE.transitioning = false;
            if (onArrival) onArrival();
        }
    });

    // 1) Fade out hero UI and audio toggle
    const heroEl = document.getElementById('ui-hero');
    if (heroEl) {
        tl.to(heroEl, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => heroEl.style.pointerEvents = 'none' }, 0);
    }
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        tl.to(audioToggle, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => audioToggle.style.pointerEvents = 'none' }, 0);
    }

    // 2) Stretch the torus into a tunnel (the "black hole" effect)
    tl.to(torusMat.uniforms.uStretch, { value: 18.0, duration: 1.2, ease: 'power2.in' }, 0.2);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp + 10.0, duration: 0.8, ease: 'power2.in' }, 0.2);
    
    // 3) Optical flash
    tl.to('#optical-flash', { opacity: 0.8, duration: 0.6, ease: 'power2.in' }, 0.6);
    
    // 4) Flash fades, warp resolves
    tl.to('#optical-flash', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.2);
    tl.to(torusMat.uniforms.uStretch, { value: 0, duration: 0.6, ease: 'power2.out' }, 1.2);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp, duration: 0.6, ease: 'power2.out' }, 1.2);
    tl.to(torusMat.uniforms.uOpacity, { value: 0.3, duration: 0.4 }, 1.2);
}

// === HERO → TIMELINE (1.0s Cinematic Doppler Warp) ===
export function initiateHeroToTimeline() {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    if (!transitionDeps) return;

    const { torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath } = transitionDeps;

    // Hard-reset scroll
    STATE.scrollY = 0;
    STATE.targetScrollY = 0;
    setScrollTargetY(0);

    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const overlay = document.getElementById('timeline-transition-overlay');
    const heroEl = document.getElementById('ui-hero');
    const audioToggle = document.getElementById('audio-toggle');

    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }

    const tl = gsap.timeline({
        onComplete: () => {
            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.opacity = '0';
            }
            STATE.phase = 'TIMELINE';
            STATE.transitioning = false;
            syncDockUI('TIMELINE');
            // Dock dead-center at milestone 0
            jumpToMilestone(0, 0.4);
        }
    });

    // 1) Fade out hero UI & audio toggle
    if (heroEl) {
        tl.to(heroEl, { opacity: 0, duration: 0.25, ease: 'power2.out', onComplete: () => heroEl.style.pointerEvents = 'none' }, 0);
    }
    if (audioToggle) {
        tl.to(audioToggle, { opacity: 0, duration: 0.25, ease: 'power2.out', onComplete: () => audioToggle.style.pointerEvents = 'none' }, 0);
    }

    // 2) Warp background 3D scene (torus stretch + optical flash)
    tl.to(torusMat.uniforms.uStretch, { value: 18.0, duration: 0.65, ease: 'power2.in' }, 0.1);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp + 10.0, duration: 0.5, ease: 'power2.in' }, 0.1);
    tl.to('#optical-flash', { opacity: 0.85, duration: 0.35, ease: 'power2.in' }, 0.45);
    tl.to('#optical-flash', { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.8);

    // 3) Show brief HUD Doppler reticle flash
    if (overlay) {
        tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.25);
        tl.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.75);
    }

    // 4) Mid-way swap scene elements while optical flash covers camera (at t=0.6s)
    tl.call(() => {
        nodeGroup.visible = true;
        torusMat.visible = false;
        gridMat.visible = true;
        starsMat.visible = true;

        ['hud', 'timeline-scale-container', 'radar-round-container'].forEach(id => {
            let el = document.getElementById(id);
            if (el) {
                el.style.display = '';
                el.style.opacity = '0';
            }
        });

        const hobbiesLayer = document.getElementById('hobbies-ui-layer');
        if (hobbiesLayer) {
            hobbiesLayer.style.display = '';
            hobbiesLayer.style.opacity = '0';
            hobbiesLayer.style.pointerEvents = 'auto';
        }
        document.querySelectorAll('.node-container').forEach(el => {
            el.style.display = 'flex';
            el.style.pointerEvents = 'auto';
        });

        const scrollHint = document.getElementById('timeline-scroll-hint');
        if (scrollHint) {
            scrollHint.style.opacity = '1';
            scrollHint.style.display = 'block';
            scrollHint.style.pointerEvents = 'auto';
        }
    }, null, 0.6);

    // 5) Warp resolves at t=0.95s
    tl.to(torusMat.uniforms.uStretch, { value: 0, duration: 0.3, ease: 'power2.out' }, 0.95);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp, duration: 0.3, ease: 'power2.out' }, 0.95);

    // 6) Timeline HUD & UI elements fade in at t=0.95s
    tl.to('#hud, #timeline-scale-container, #radar-round-container, #hobbies-ui-layer', { 
        opacity: 1, 
        duration: 0.35,
        ease: 'power2.out',
        onStart: () => {
            ['hud', 'timeline-scale-container', 'radar-round-container'].forEach(id => {
                let el = document.getElementById(id);
                if(el) el.style.pointerEvents = 'auto';
            });
        } 
    }, 0.95);
}

// === HERO → WORKS ===
export function initiateHeroToWorks() {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    if (!transitionDeps) return;

    const { torusMesh, torusMat, researchMesh } = transitionDeps;

    blackHoleZoom(torusMesh, torusMat, 'WORKS', () => {
        syncDockUI('WORKS');
        // Hide timeline geometry
        if (transitionDeps.nodeGroup) transitionDeps.nodeGroup.visible = false;
        if (transitionDeps.gridMat) transitionDeps.gridMat.visible = false;
        if (transitionDeps.starsMat) transitionDeps.starsMat.visible = false;
        
        // Reset torus for hero return
        torusMat.uniforms.uOpacity.value = 0;
        torusMat.visible = false;

        // Camera to works position
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);
        camera.fov = 45;
        camera.updateProjectionMatrix();

        // Show works UI
        const worksUI = document.getElementById('ui-works');
        if (worksUI) {
            worksUI.style.display = 'block';
            worksUI.style.opacity = 0;
            gsap.to(worksUI, { opacity: 1, duration: 0.6 });
        }

        // Show first exhibit (Megh)
        import('../components/worksSection.js').then(mod => {
            if (mod.showExhibit) mod.showExhibit(0);
        });

        // Hide hero
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) heroEl.style.pointerEvents = 'none';
    });
}

// === TIMELINE → HERO ===
export function initiateTimelineToHero() {
    if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
    if (!transitionDeps) return;

    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const { torusMesh, torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;

    // Fade out timeline UI
    gsap.to('#hud, #timeline-scale-container, #radar-round-container', { 
        opacity: 0, 
        duration: 0.4,
        onComplete: () => {
            ['hud', 'timeline-scale-container', 'radar-round-container'].forEach(id => {
                let el = document.getElementById(id);
                if(el) el.style.pointerEvents = 'none';
            });
        }
    });
    const hobbiesLayer = document.getElementById('hobbies-ui-layer');
    gsap.to('#hobbies-ui-layer', { 
        opacity: 0, 
        duration: 0.4,
        onComplete: () => {
            if (hobbiesLayer) hobbiesLayer.style.pointerEvents = 'none';
        }
    });
    document.querySelectorAll('.node-container').forEach(el => {
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
    });

    // Fade out timeline geometry
    gsap.to(torusMat.uniforms.uOpacity, { value: 0, duration: 0.8, ease: 'power2.in' });
    gsap.to(gridMat.uniforms.uOpacity, { value: 0, duration: 0.8, ease: 'power2.in' });
    gsap.to(starsMat.uniforms.uOpacity, { value: 0, duration: 0.8, ease: 'power2.in' });

    const tl = gsap.timeline({
        onComplete: () => {
            STATE.phase = 'HERO';
            STATE.transitioning = false;
            syncDockUI('HERO');
        }
    });

    tl.call(() => {
        nodeGroup.visible = false;
        gridMat.visible = false;
        torusMat.visible = false;
        starsMat.visible = false;

        // Camera to hero position
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
        camera.fov = 75;
        camera.updateProjectionMatrix();

        // Restore torus for hero
        torusMat.visible = true;
        torusMat.uniforms.uOpacity.value = 1;
        torusMat.uniforms.uStretch.value = 0;
        torusMesh.scale.set(2.5, 2.5, 2.5);
    }, null, 0.8);

    // Show hero UI and audio toggle
    tl.call(() => {
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) {
            heroEl.style.display = 'block';
            heroEl.style.pointerEvents = 'auto';
            gsap.to('#ui-hero', { opacity: 1, duration: 0.8 });
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.style.pointerEvents = 'auto';
            gsap.to(audioToggle, { opacity: 1, duration: 0.8 });
        }
    }, null, 1.0);
}

// === WORKS → HERO ===
export function initiateWorksToHero() {
    if (STATE.phase !== 'WORKS' || STATE.transitioning) return;
    if (!transitionDeps) return;

    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const { torusMesh, torusMat } = transitionDeps;

    // Fade out works UI
    const worksUI = document.getElementById('ui-works');
    if (worksUI) gsap.to(worksUI, { opacity: 0, duration: 0.4 });

    // Destroy current exhibit
    import('../components/worksSection.js').then(mod => {
        if (mod.destroyCurrentExhibit) mod.destroyCurrentExhibit();
    });

    // Hide GeoFNO container if visible
    const geofnoContainer = document.getElementById('geofno-container');
    if (geofnoContainer) geofnoContainer.style.display = 'none';
    const isingContainer = document.getElementById('ising-container');
    if (isingContainer) isingContainer.style.display = 'none';

    const tl = gsap.timeline({
        onComplete: () => {
            STATE.phase = 'HERO';
            STATE.transitioning = false;
            syncDockUI('HERO');
        }
    });

    tl.call(() => {
        // Camera to hero
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
        camera.fov = 75;
        camera.updateProjectionMatrix();

        // Restore torus
        torusMat.visible = true;
        torusMat.uniforms.uOpacity.value = 1;
        torusMat.uniforms.uStretch.value = 0;
        torusMesh.scale.set(2.5, 2.5, 2.5);
    }, null, 0.2);

    tl.call(() => {
        if (worksUI) worksUI.style.display = 'none';
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) {
            heroEl.style.display = 'block';
            heroEl.style.pointerEvents = 'auto';
            gsap.to('#ui-hero', { opacity: 1, duration: 0.8 });
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.style.pointerEvents = 'auto';
            gsap.to(audioToggle, { opacity: 1, duration: 0.8 });
        }
    }, null, 0.4);
}

// === WORKS → RESEARCH ===
export function initiateWorksToResearch() {
    navigateToSector('RESEARCH');
}

// === RESEARCH → HERO ===
export function initiateResearchToHero() {
    if (STATE.phase !== 'RESEARCH' || STATE.transitioning) return;
    if (!transitionDeps) return;

    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const { torusMesh, torusMat, researchMesh } = transitionDeps;

    // Fade out research UI
    const researchUI = document.getElementById('ui-research');
    if (researchUI) gsap.to(researchUI, { opacity: 0, duration: 0.4 });
    const leftHemi = document.getElementById('left-hemi');
    if (leftHemi) gsap.to(leftHemi, { opacity: 0, duration: 0.4 });
    const bgCanvas = document.getElementById('research-bg-canvas');
    if (bgCanvas) gsap.to(bgCanvas, { opacity: 0, duration: 0.4 });

    const tl = gsap.timeline({
        onComplete: () => {
            if (researchUI) researchUI.style.display = 'none';
            researchMesh.visible = false;
            researchLights.visible = false;

            STATE.phase = 'HERO';
            STATE.transitioning = false;
            syncDockUI('HERO');
        }
    });

    // Shrink research mesh
    tl.to(researchMesh.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.8, ease: 'power2.in' }, 0);

    // Camera back to hero
    tl.call(() => {
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
        camera.fov = 75;
        camera.updateProjectionMatrix();

        // Restore torus
        torusMat.visible = true;
        torusMat.uniforms.uOpacity.value = 1;
        torusMat.uniforms.uStretch.value = 0;
        torusMesh.scale.set(2.5, 2.5, 2.5);
    }, null, 0.5);

    // Show hero and audio toggle
    tl.call(() => {
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) {
            heroEl.style.display = 'block';
            heroEl.style.pointerEvents = 'auto';
            gsap.to('#ui-hero', { opacity: 1, duration: 0.8 });
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.style.pointerEvents = 'auto';
            gsap.to(audioToggle, { opacity: 1, duration: 0.8 });
        }
    }, null, 0.8);
}

// === UNIFIED GLOBAL SECTOR ROUTER ===

export function syncDockUI(phase) {
    const sectorMap = {
        'HERO': '00 ORIGIN',
        'TIMELINE': '01 TIMELINE',
        'WORKS': '02 HIGHLIGHTS',
        'RESEARCH': '03 ARCHIVE',
        'PLAYGROUND': '04 PLAYGROUND'
    };
    const sectorEl = document.getElementById('dock-active-sector-id');
    if (sectorEl && sectorMap[phase]) {
        sectorEl.textContent = sectorMap[phase];
    }
    const buttons = document.querySelectorAll('.global-nav-dock .dock-btn[data-sector]');
    buttons.forEach(btn => {
        if (btn.dataset.sector === phase) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function unmountSector(phase, deps) {
    if (!deps) return;
    const { torusMat, gridMat, starsMat, nodeGroup, researchMesh } = deps;

    if (phase === 'HERO') {
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) {
            heroEl.style.opacity = '0';
            heroEl.style.pointerEvents = 'none';
            setTimeout(() => { if (STATE.phase !== 'HERO') heroEl.style.display = 'none'; }, 300);
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.style.opacity = '0';
            audioToggle.style.pointerEvents = 'none';
        }
    } else if (phase === 'TIMELINE') {
        ['hud', 'timeline-scale-container', 'radar-round-container', 'hobbies-ui-layer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        });
        document.querySelectorAll('.node-container').forEach(el => {
            el.style.display = 'none';
            el.style.pointerEvents = 'none';
        });
        const scrollHint = document.getElementById('timeline-scroll-hint');
        if (scrollHint) {
            scrollHint.style.opacity = '0';
            scrollHint.style.pointerEvents = 'none';
        }
        if (nodeGroup) nodeGroup.visible = false;
        if (gridMat) gridMat.visible = false;
        if (starsMat) starsMat.visible = false;
    } else if (phase === 'WORKS') {
        const worksUI = document.getElementById('ui-works');
        if (worksUI) {
            worksUI.style.opacity = '0';
            setTimeout(() => { if (STATE.phase !== 'WORKS') worksUI.style.display = 'none'; }, 300);
        }
        import('../components/worksSection.js').then(mod => {
            if (mod.destroyCurrentExhibit) mod.destroyCurrentExhibit();
        });
        const geofnoContainer = document.getElementById('geofno-container');
        if (geofnoContainer) geofnoContainer.style.display = 'none';
        const isingContainer = document.getElementById('ising-container');
        if (isingContainer) isingContainer.style.display = 'none';
    } else if (phase === 'RESEARCH') {
        const researchUI = document.getElementById('ui-research');
        if (researchUI) {
            researchUI.style.opacity = '0';
            setTimeout(() => { if (STATE.phase !== 'RESEARCH') researchUI.style.display = 'none'; }, 300);
        }
        if (researchMesh) researchMesh.visible = false;
        if (researchLights) researchLights.visible = false;
        const bgCanvas = document.getElementById('research-bg-canvas');
        if (bgCanvas) bgCanvas.style.opacity = '0';
    } else if (phase === 'PLAYGROUND') {
        const pgUI = document.getElementById('ui-playground');
        if (pgUI) {
            pgUI.style.opacity = '0';
            setTimeout(() => { if (STATE.phase !== 'PLAYGROUND') pgUI.style.display = 'none'; }, 300);
        }
        const modal = document.getElementById('playground-modal');
        if (modal) {
            modal.classList.remove('active');
            const iframe = document.getElementById('playground-iframe');
            if (iframe) iframe.src = 'about:blank';
        }
    }
}

function mountSector(targetPhase, deps) {
    if (!deps) return;
    const { torusMesh, torusMat, gridMat, starsMat, nodeGroup, researchMesh } = deps;

    if (targetPhase === 'HERO') {
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
        camera.fov = 75;
        camera.updateProjectionMatrix();

        if (torusMat) {
            torusMat.visible = true;
            torusMat.uniforms.uOpacity.value = 1;
            torusMat.uniforms.uStretch.value = 0;
            torusMesh.scale.set(2.5, 2.5, 2.5);
        }
        const heroEl = document.getElementById('ui-hero');
        if (heroEl) {
            heroEl.style.display = 'block';
            heroEl.style.opacity = '1';
            heroEl.style.pointerEvents = 'auto';
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.style.opacity = '1';
            audioToggle.style.pointerEvents = 'auto';
        }
    } else if (targetPhase === 'TIMELINE') {
        if (torusMat) torusMat.visible = false;
        if (nodeGroup) nodeGroup.visible = true;
        if (gridMat) {
            gridMat.visible = true;
            gridMat.uniforms.uOpacity.value = 1;
        }
        if (starsMat) {
            starsMat.visible = true;
            starsMat.uniforms.uOpacity.value = 1;
        }

        ['hud', 'timeline-scale-container', 'radar-round-container', 'hobbies-ui-layer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = '';
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            }
        });
        document.querySelectorAll('.node-container').forEach(el => {
            el.style.display = 'flex';
            el.style.pointerEvents = 'auto';
        });
        const scrollHint = document.getElementById('timeline-scroll-hint');
        if (scrollHint) {
            scrollHint.style.opacity = '1';
            scrollHint.style.display = 'block';
            scrollHint.style.pointerEvents = 'auto';
        }
        jumpToMilestone(STATE.activeSnapIndex >= 0 ? STATE.activeSnapIndex : 0, 0.4);
    } else if (targetPhase === 'WORKS') {
        if (torusMat) torusMat.visible = false;
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);
        camera.fov = 45;
        camera.updateProjectionMatrix();

        const worksUI = document.getElementById('ui-works');
        if (worksUI) {
            worksUI.style.display = 'block';
            worksUI.style.opacity = '1';
        }
        import('../components/worksSection.js').then(mod => {
            if (mod.showExhibit) mod.showExhibit(STATE.worksExhibitIndex >= 0 ? STATE.worksExhibitIndex : 0);
        });
    } else if (targetPhase === 'RESEARCH') {
        if (torusMat) torusMat.visible = false;
        camera.position.set(8, 6, 8);
        camera.lookAt(0, 0, 0);
        camera.fov = 45;
        camera.updateProjectionMatrix();

        if (researchMesh) {
            researchMesh.visible = true;
            researchMesh.scale.set(1, 1, 1);
            researchMesh.position.set(0, 0, 0);
        }
        if (researchLights) researchLights.visible = true;

        const researchUI = document.getElementById('ui-research');
        if (researchUI) {
            researchUI.style.display = 'block';
            researchUI.style.opacity = '1';
        }
        const leftHemi = document.getElementById('left-hemi');
        if (leftHemi) leftHemi.style.opacity = '1';

        const bgCanvas = document.getElementById('research-bg-canvas');
        if (bgCanvas) {
            bgCanvas.style.opacity = '1';
            initResearchBG();
            import('../components/researchBackground.js').then(m => m.bindResearchMouse());
        }
        updateResearchCards(0);
        window.dispatchEvent(new Event('resize'));
    } else if (targetPhase === 'PLAYGROUND') {
        camera.position.set(0, 0, 45);
        camera.lookAt(0, 0, 0);
        camera.fov = 60;
        camera.updateProjectionMatrix();

        if (torusMat) {
            torusMat.visible = true;
            torusMat.uniforms.uOpacity.value = 0.25;
            torusMat.uniforms.uStretch.value = 0;
            torusMesh.scale.set(2.0, 2.0, 2.0);
        }

        const pgUI = document.getElementById('ui-playground');
        if (pgUI) {
            pgUI.style.display = 'block';
            pgUI.style.opacity = '1';
        }
        import('../components/playgroundSection.js').then(mod => {
            if (mod.initPlayground) mod.initPlayground();
        });
    }
}

export function navigateToSector(targetSector) {
    if (STATE.phase === targetSector || STATE.transitioning || STATE.phase === 'LOADING') return;

    // Special cinematic Doppler warp for HERO -> TIMELINE
    if (STATE.phase === 'HERO' && targetSector === 'TIMELINE') {
        initiateHeroToTimeline();
        return;
    }

    if (!transitionDeps) return;

    STATE.transitioning = true;
    const prevPhase = STATE.phase;
    STATE.phase = 'TRANSITION';

    // Unmount previous phase
    unmountSector(prevPhase, transitionDeps);

    // Quick optical flash
    const flash = document.getElementById('optical-flash');
    if (flash) {
        gsap.to(flash, { opacity: 0.75, duration: 0.2, ease: 'power2.in', yoyo: true, repeat: 1, onComplete: () => {
            flash.style.opacity = '0';
        }});
    }

    setTimeout(() => {
        mountSector(targetSector, transitionDeps);
        STATE.phase = targetSector;
        STATE.transitioning = false;
        syncDockUI(targetSector);
    }, 280);
}