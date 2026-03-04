import * as THREE from 'three';
import gsap from 'gsap';
import { setScrollTargetY } from './scroll.js';
import { CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { camera } from '../core/scene.js';
import { initResearchBG } from '../components/researchBackground.js';
import { researchLights } from '../components/researchTopology.js';

export function initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    gsap.to('#ui-hero', { opacity: 0, duration: 0.6, ease: 'power2.out' });
    nodeGroup.visible = true;

    const endPos = cameraPath.getPointAt(0);
    const lookTarget = cameraPath.getPointAt(0.01);

    const tl = gsap.timeline({
        onUpdate() {
            // Damped camera chase — quaternion slerp each tick
            const dummy = camera.clone();
            dummy.position.copy(camera.position);
            const focus = new THREE.Vector3().lerpVectors(
                new THREE.Vector3(0, 0, 0), lookTarget, tl.progress() ** 2
            );
            dummy.lookAt(focus);
            camera.quaternion.slerp(dummy.quaternion, 0.1);
        },
        onComplete() {
            STATE.phase = 'TIMELINE';
            STATE.transitioning = false;
            gsap.to('#hud', { opacity: 1, duration: 0.5 });
            gsap.to('#hobbies-ui-layer', { opacity: 1, duration: 0.5 });
        }
    });

    // All tweens start at t=0 for parallel playback
    tl.to(camera.position, { x: endPos.x, y: endPos.y, z: endPos.z, duration: 2, ease: 'power3.inOut' }, 0);
    tl.to(torusMat.uniforms.uStretch, { value: 18.0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp + 3.0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(gridMat.uniforms.uOpacity, { value: 1, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(starsMat.uniforms.uOpacity, { value: 1, duration: 2, ease: 'power2.inOut' }, 0);

    // Relativistic Spaghettification (Scale up past camera & Blur)
    tl.to('#fourier-container', {
        scale: 12,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.5,
        ease: 'expo.in',
        onComplete: () => { document.getElementById('fourier-container').style.display = 'none'; }
    }, 0);

    // Optical Warp Flash
    tl.to('#optical-flash', { opacity: 0.8, duration: 1.0, ease: 'power2.in' }, 0.5);
    tl.to('#optical-flash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 1.5);

    tl.to('.scanlines', { opacity: 0.6, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to('.vignette', { background: 'radial-gradient(circle at center, transparent 20%, #000 120%)', duration: 2 }, 0);
}

export function initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    gsap.to('#hud', { opacity: 0, duration: 0.4 });
    gsap.to('#hobbies-ui-layer', { opacity: 0, duration: 0.4 });

    const endPos = new THREE.Vector3(0, 0, 50);

    nodeGroup.visible = false;

    // Immediately hide any DOM node labels to prevent them from sticking to the screen
    document.querySelectorAll('.node-container').forEach(el => {
        el.style.display = 'none';

        // Reset expanded cards just in case
        const card = el.querySelector('.hud-card');
        if (card) {
            card.classList.remove('expanded');
            card.classList.add('minimized');
        }

        // Reset button
        const btn = el.querySelector('.expander-btn');
        if (btn) btn.innerHTML = "[ + ]";
    });

    const tl = gsap.timeline({
        onUpdate() {
            const dummy = camera.clone();
            dummy.position.copy(camera.position);
            dummy.lookAt(0, 0, 0);
            camera.quaternion.slerp(dummy.quaternion, 0.1);
        },
        onComplete() {
            STATE.phase = 'HERO';
            STATE.transitioning = false;
            STATE.targetScrollY = 0;
            STATE.scrollY = 0;
            gsap.to('#ui-hero', { opacity: 1, duration: 0.8 });
        }
    });

    tl.to(camera.position, { x: endPos.x, y: endPos.y, z: endPos.z, duration: 2, ease: 'power3.inOut' }, 0);
    tl.to(torusMat.uniforms.uStretch, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(gridMat.uniforms.uOpacity, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(starsMat.uniforms.uOpacity, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);

    // Restore DOM Node for rendering
    document.getElementById('fourier-container').style.display = 'block';

    // HTML Reverse Spaghettification 
    tl.to('#fourier-container', {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 2.0,
        ease: 'expo.out'
    }, 0);

    // Optical Warp Flash (Reverse)
    tl.to('#optical-flash', { opacity: 0.8, duration: 0.4, ease: 'power2.in' }, 0);
    tl.to('#optical-flash', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.8);

    tl.to('.scanlines', { opacity: 0.15, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to('.vignette', { background: 'radial-gradient(circle at center, transparent 40%, #000 150%)', duration: 2 }, 0);
}

export function initiateResearchTransition(torusMat, gridMat, starsMat, nodeGroup, researchMesh) {
    if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;
    STATE.researchVelocity = 0;
    STATE.researchScrollY = 0;

    // Fade out timeline HUD quickly and block pointer events
    gsap.to('#hud', { opacity: 0, duration: 0.4 });
    document.getElementById('hud').style.pointerEvents = 'none';

    gsap.to('#hobbies-ui-layer', { opacity: 0, duration: 0.4 });
    const hobbiesLayer = document.getElementById('hobbies-ui-layer');
    if (hobbiesLayer) hobbiesLayer.style.pointerEvents = 'none';

    gsap.to('#quantum-world-line', { opacity: 0, duration: 0.4 });

    // Hide DOM Node UI
    document.querySelectorAll('.node-container').forEach(el => {
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
    });

    // Reset research elements immediately so they can transition in correctly
    const researchUI = document.getElementById('ui-research');
    if (researchUI) {
        researchUI.style.display = 'block';
        researchUI.style.opacity = 0;
    }
    document.getElementById('research-cards-container').style.opacity = 0;
    const bgCanvas = document.getElementById('research-bg-canvas');
    if (bgCanvas) bgCanvas.style.opacity = 0;

    // Explicitly hide left-hemi DOM until Torus scales up
    const leftHemi = document.getElementById('left-hemi');
    if (leftHemi) leftHemi.style.opacity = 0;

    // Calculate dynamic end point deep in the Z axis
    const startZ = camera.position.z;
    const warpDepth = startZ - 1500;

    const tl = gsap.timeline({
        onComplete() {
            STATE.phase = 'RESEARCH';
            STATE.transitioning = false;
        }
    });

    // 1. FOV Stretch (Spaghettification)
    tl.to(camera, {
        fov: 120,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => { camera.updateProjectionMatrix(); }
    }, 0);

    // 2. Warp Speed past the end of the grid into pure blackness
    tl.to(camera.position, { z: warpDepth, duration: 2.2, ease: 'power3.in' }, 0);

    // 3. Fade out timeline geometry rapidly as we warp
    tl.to(torusMat.uniforms.uOpacity, { value: 0, duration: 1.0, ease: 'power2.in' }, 0.5);
    tl.to(gridMat.uniforms.uOpacity, { value: 0, duration: 1.0, ease: 'power2.in' }, 0.5);
    tl.to(starsMat.uniforms.uOpacity, { value: 0, duration: 1.5, ease: 'power2.in' }, 0.7);

    // 4. MÖBIUS GENESIS 
    // Wait until warp is fully saturated (2.2s), then swap coordinates after extreme short 0.1s void
    tl.call(() => {
        // Unmount timeline elements completely to save GPU cycles while in Research Chamber
        nodeGroup.visible = false;
        gridMat.visible = false;
        torusMat.visible = false;
        starsMat.visible = false;


        // Lock camera to the research station coordinate
        camera.position.set(8, 6, 8);
        camera.lookAt(0, 0, 0);

        // Prep the Research Mesh right at the origin, solid wireframe torus at 0.001 scale
        researchMesh.visible = true;
        researchLights.visible = true;
        researchMesh.scale.set(0.001, 0.001, 0.001);
        researchMesh.position.set(0, 0, 0);

        // Crucial: Unblock the parent UI wrapper so the leftHemi canvas can actually be seen!
        if (researchUI) researchUI.style.display = 'block';
    }, null, 2.3);

    // Fade FOV down to 45 quickly right as genesis starts
    tl.to(camera, { fov: 45, duration: 0.5, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 2.3);

    // Fade in the master UI wrapper instantly, and gracefully fade the left-hemi WebGL layer 
    if (researchUI) tl.to(researchUI, { opacity: 1, duration: 0.1 }, 2.3);
    if (leftHemi) tl.to(leftHemi, { opacity: 1, duration: 0.5 }, 2.3);

    // Pop the torus in exactly at the center (VISIBLY this time!)
    tl.to(researchMesh.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'expo.out' }, 2.4);

    // 5. Fade in beautiful new UI elements remaining (Background & Cards)
    tl.call(() => {
        if (bgCanvas) {
            initResearchBG();
            import('../components/researchBackground.js').then(m => m.bindResearchMouse());
        }
        window.dispatchEvent(new Event('resize'));
    }, null, 2.8);

    if (bgCanvas) tl.to(bgCanvas, { opacity: 1, duration: 2.0 }, 3.0);
    tl.to('#research-cards-container', { opacity: 1, duration: 1.5 }, 3.1);

    // Stagger in cards from bottom
    tl.fromTo('.research-card',
        { y: 50, opacity: 0 },
        { y: "-50%", opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, 3.3);
}

export function initiateTimelineReturn(torusMat, gridMat, starsMat, nodeGroup, researchMesh, cameraPath) {
    if (STATE.phase !== 'RESEARCH' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    // Fade out Research UI quickly
    const researchUI = document.getElementById('ui-research');
    if (researchUI) researchUI.style.opacity = 0;

    // Pre-calculate the exact destination point on the spline we are returning to
    // The total virtual scroll maxes out at 8000. 
    // We want the reverse scroll to land exactly at the precipice of the timeline plunge (Year 2026).
    const thresholdScroll = 5700; // Physical scroll units (approx 82% of 8000)
    const timelineProgress = Math.min(Math.max(thresholdScroll / 8000, 0), 1.0);
    const targetPos = cameraPath.getPointAt(timelineProgress);
    const targetLook = cameraPath.getPointAt(Math.min(timelineProgress + 0.01, 1.0));

    // Calculate a dynamic start position for lookAt interpolation
    const startLook = { x: 0, y: 0, z: 0 };

    // HARD SYNC 1: Immediately lock scroll.js coordinates to the end destination.
    // This prevents animate.js from grabbing default targetY=0 if a race condition hits.
    STATE.scrollY = thresholdScroll;
    STATE.targetScrollY = thresholdScroll;
    setScrollTargetY(thresholdScroll);

    // An object to hold our tweenable lookAt target during the transition
    const lookTarget = { x: startLook.x, y: startLook.y, z: startLook.z };

    const tl = gsap.timeline({
        onUpdate() {
            camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
        },
        onComplete() {
            if (researchUI) researchUI.style.display = 'none';
            researchMesh.visible = false;
            researchLights.visible = false;

            // Turn off Dual-Renderer DOM
            const leftHemi = document.getElementById('left-hemi');
            if (leftHemi) leftHemi.style.opacity = 0;

            nodeGroup.visible = true;


            // Turn WebGL rendering bounds physically back on before scaling Opacity up
            torusMat.visible = true;
            gridMat.visible = true;
            starsMat.visible = true;

            // Fade Timeline HUD back in and restore interactivity
            gsap.to('#hud', { opacity: 1, duration: 0.5, onStart: () => document.getElementById('hud').style.pointerEvents = 'auto' });

            const hobbiesLayer = document.getElementById('hobbies-ui-layer');
            gsap.to('#hobbies-ui-layer', { opacity: 1, duration: 0.5, onStart: () => { if (hobbiesLayer) hobbiesLayer.style.pointerEvents = 'auto'; } });

            // Unhide nodes and restore events
            document.querySelectorAll('.node-container').forEach(el => {
                el.style.display = 'flex';
                el.style.pointerEvents = 'auto';
            });

            STATE.phase = 'TIMELINE';
            STATE.transitioning = false;
        }
    });

    // Pop research torus out
    gsap.to(researchMesh.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.0, ease: 'power2.in' });

    // Stretch FOV back out for Timeline
    tl.to(camera, { fov: 75, duration: 1.0, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 0.0);

    // Physically glide the camera's X, Y, Z back to the absolute coordinate on the timeline spline
    tl.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y, // animate.js will independently add the breathing sine wave later
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut'
    }, 0.0);

    // Smoothly rotate the camera's neck from staring at the Torus origin (0,0,0) towards the timeline track ahead
    tl.to(lookTarget, {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: 2.5,
        ease: 'power3.inOut'
    }, 0.0);

    // Fade in timeline background geometry at the tail end of the transition
    tl.to(torusMat.uniforms.uOpacity, { value: 1, duration: 1.5, ease: 'power2.out' }, 1.0);
    tl.to(gridMat.uniforms.uOpacity, { value: 1, duration: 1.5, ease: 'power2.out' }, 1.0);
    tl.to(starsMat.uniforms.uOpacity, { value: 1, duration: 1.5, ease: 'power2.out' }, 1.5);
}
