import * as THREE from 'three';
import gsap from 'gsap';
import { CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { camera } from '../core/scene.js';

export function initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    // UI Out
    gsap.to('#ui-hero', { opacity: 0, duration: 1, ease: 'power2.inOut' });

    nodeGroup.visible = true;

    // 1. Position Setup
    const endCamPos = cameraPath.getPointAt(0);
    const initialLookAt = cameraPath.getPointAt(0.01);

    const tl = gsap.timeline({
        onUpdate: () => {
            // Camera Rotation (Damped "Chase" Logic) - kept manual for fluid feeling during tween
            const dummy = camera.clone();
            dummy.position.copy(camera.position);
            const currentFocus = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 0, 0), initialLookAt, tl.progress());
            dummy.lookAt(currentFocus);
            camera.quaternion.slerp(dummy.quaternion, 0.1);
        },
        onComplete: () => {
            STATE.phase = 'TIMELINE';
            STATE.transitioning = false;
            gsap.to('#hud', { opacity: 1, duration: 0.5 });
        }
    });

    // Parallel Animations
    tl.to(camera.position, {
        x: endCamPos.x,
        y: endCamPos.y,
        z: endCamPos.z,
        duration: 2,
        ease: 'power3.inOut'
    }, 0);

    tl.to(torusMat.uniforms.uStretch, { value: 18.0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(torusMat.uniforms.uTemperature, { value: CONFIG.minTemp + 3.0, duration: 2, ease: 'power2.inOut' }, 0);

    tl.to(gridMat.uniforms.uOpacity, { value: 1, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(starsMat.uniforms.uOpacity, { value: 1, duration: 2, ease: 'power2.inOut' }, 0);
}

export function initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION';
    STATE.transitioning = true;

    gsap.to('#hud', { opacity: 0, duration: 0.5 });

    const endCamPos = new THREE.Vector3(0, 0, 50);

    const tl = gsap.timeline({
        onUpdate: () => {
            // Camera Rotation Chase
            const dummy = camera.clone();
            dummy.position.copy(camera.position);
            dummy.lookAt(0, 0, 0);
            camera.quaternion.slerp(dummy.quaternion, 0.1);
        },
        onComplete: () => {
            STATE.phase = 'HERO';
            STATE.transitioning = false;
            STATE.targetScrollY = 0;
            STATE.scrollY = 0;
            nodeGroup.visible = false;
            gsap.to('#ui-hero', { opacity: 1, duration: 1 });
        }
    });

    tl.to(camera.position, {
        x: endCamPos.x,
        y: endCamPos.y,
        z: endCamPos.z,
        duration: 2,
        ease: 'power3.inOut'
    }, 0);

    tl.to(torusMat.uniforms.uStretch, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);

    tl.to(gridMat.uniforms.uOpacity, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);
    tl.to(starsMat.uniforms.uOpacity, { value: 0, duration: 2, ease: 'power2.inOut' }, 0);
}
