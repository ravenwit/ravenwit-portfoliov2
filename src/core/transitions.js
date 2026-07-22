import * as THREE from 'three';
import gsap from 'gsap';
import { setScrollTargetY } from './scroll.js';
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
        tl.to(heroEl, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);
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

// === HERO → TIMELINE ===
export function initiateHeroToTimeline() {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    if (!transitionDeps) return;

    const { torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath } = transitionDeps;

    // Hard-reset scroll
    STATE.scrollY = 0;
    STATE.targetScrollY = 0;
    setScrollTargetY(0);

    blackHoleZoom(torusMesh, torusMat, 'TIMELINE', () => {
        // Restore timeline scene
        nodeGroup.visible = true;
        torusMat.visible = false;
        torusMat.uniforms.uOpacity.value = 0;
        gridMat.visible = true;
        gridMat.uniforms.uOpacity.value = 1;
        starsMat.visible = true;
        starsMat.uniforms.uOpacity.value = 1;
        torusMesh.scale.set(1, 1, 1);

        // Camera to path start
        const startPos = cameraPath.getPointAt(0);
        const lookPos = cameraPath.getPointAt(0.01);
        camera.position.copy(startPos);
        camera.lookAt(lookPos);
        camera.fov = 75;
        camera.updateProjectionMatrix();

        // Show timeline UI — ensure display is set before GSAP opacity animation
        ['hud', 'timeline-scale-container', 'radar-round-container'].forEach(id => {
            let el = document.getElementById(id);
            if (el) {
                el.style.display = '';
                el.style.opacity = 0;
            }
        });
        gsap.to('#hud, #timeline-scale-container, #radar-round-container', { 
            opacity: 1, 
            duration: 0.5,
            onStart: () => {
                ['hud', 'timeline-scale-container', 'radar-round-container'].forEach(id => {
                    let el = document.getElementById(id);
                    if(el) el.style.pointerEvents = 'auto';
                });
            } 
        });

        // Ensure hobbies layer is visible
        const hobbiesLayer = document.getElementById('hobbies-ui-layer');
        if (hobbiesLayer) {
            hobbiesLayer.style.display = '';
            hobbiesLayer.style.opacity = 0;
        }
        gsap.to('#hobbies-ui-layer', { opacity: 1, duration: 0.5 });
        document.querySelectorAll('.node-container').forEach(el => {
            el.style.display = 'flex';
            el.style.pointerEvents = 'auto';
        });
    });
}

// === HERO → WORKS ===
export function initiateHeroToWorks() {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    if (!transitionDeps) return;

    const { torusMesh, torusMat, researchMesh } = transitionDeps;

    blackHoleZoom(torusMesh, torusMat, 'WORKS', () => {
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
    gsap.to('#hobbies-ui-layer', { opacity: 0, duration: 0.4 });
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
    if (STATE.phase !== 'WORKS' || STATE.transitioning) return;
    if (!transitionDeps) return;

    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    const { torusMesh, torusMat, researchMesh } = transitionDeps;

    STATE.researchScrollY = 0;
    STATE.researchVelocity = 0;

    const worksUI = document.getElementById('ui-works');
    if (worksUI) gsap.to(worksUI, { opacity: 0, duration: 0.3 });

    // Destroy current exhibit
    import('../components/worksSection.js').then(mod => {
        if (mod.destroyCurrentExhibit) mod.destroyCurrentExhibit();
    });

    const geofnoContainer = document.getElementById('geofno-container');
    if (geofnoContainer) geofnoContainer.style.display = 'none';
    const isingContainer = document.getElementById('ising-container');
    if (isingContainer) isingContainer.style.display = 'none';

    // 1. SHOW FULLSCREEN LOADER FIRST
    const loader = document.getElementById('research-loading-overlay');
    const topoWord = document.getElementById('loading-word-topology');
    const wavesWord = document.getElementById('loading-word-waves');
    if (loader) {
        if (topoWord) {
            topoWord.style.top = '0px';
            topoWord.style.opacity = '1';
        }
        if (wavesWord) {
            wavesWord.style.top = '20px';
            wavesWord.style.opacity = '0';
        }
        loader.style.display = 'flex';
        loader.offsetHeight; // Force reflow
        loader.style.opacity = '1';
    }

    if (topoWord && wavesWord) {
        setTimeout(() => {
            topoWord.style.top = '-20px';
            topoWord.style.opacity = '0';
            wavesWord.style.top = '0px';
            wavesWord.style.opacity = '1';
        }, 1500); // 500ms fade-in + 1000ms reading time for TOPOLOGY
    }

    // 2. WAIT FOR BROWSER TO PAINT LOADER BEFORE FREEZING WITH SHADER COMPILE
    setTimeout(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                STATE.phase = 'RESEARCH';
                STATE.transitioning = false;
                if (loader) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 500);
                }
            }
        });

        tl.call(() => {
            // Mount research
            researchMesh.visible = true;
            researchLights.visible = true;
            researchMesh.scale.set(0.001, 0.001, 0.001);
            researchMesh.position.set(0, 0, 0);

            // Hide torus
            torusMat.visible = false;

            // Camera to research position
            camera.position.set(8, 6, 8);
            camera.lookAt(0, 0, 0);
            camera.fov = 45;
            camera.updateProjectionMatrix();
        }, null, 0.2);

        // Grow research mesh
        tl.to(researchMesh.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'expo.out' }, 0.3);

        // Show research UI
        const researchUI = document.getElementById('ui-research');
        if (researchUI) {
            researchUI.style.display = 'block';
            researchUI.style.opacity = 0;
            tl.to(researchUI, { opacity: 1, duration: 0.8 }, 0.5);
        }
        const leftHemi = document.getElementById('left-hemi');
        if (leftHemi) {
            leftHemi.style.opacity = 0;
            tl.to(leftHemi, { opacity: 1, duration: 0.8 }, 0.5);
        }
        const bgCanvas = document.getElementById('research-bg-canvas');
        if (bgCanvas) {
            bgCanvas.style.opacity = 0;
            tl.to(bgCanvas, { opacity: 1, duration: 0.8 }, 0.5);
        }

        tl.call(() => {
            if (bgCanvas) {
                initResearchBG();
                import('../components/researchBackground.js').then(m => m.bindResearchMouse());
            }
            updateResearchCards(0);
            window.dispatchEvent(new Event('resize'));
        }, null, 0.8);

        tl.fromTo('#research-cards-container', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.0);
        tl.fromTo('.research-card', { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, 1.1);

        if (worksUI) {
            tl.call(() => { worksUI.style.display = 'none'; }, null, 0.5);
        }
    }, 2400); // 1500ms wait + 400ms animation + 500ms to read WAVES before freezing
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