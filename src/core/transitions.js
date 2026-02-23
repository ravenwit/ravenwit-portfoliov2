import * as THREE from 'three';
import gsap from 'gsap';
import { CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { camera } from '../core/scene.js';

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
