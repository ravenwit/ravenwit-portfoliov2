import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { camera } from '../core/scene.js';

export function initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'HERO' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION'; STATE.transitioning = true;
    document.getElementById('ui-hero').style.opacity = 0;

    const startTime = performance.now();

    // 1. Position Setup
    const startCamPos = camera.position.clone();
    const endCamPos = cameraPath.getPointAt(0);
    const initialLookAt = cameraPath.getPointAt(0.01);

    nodeGroup.visible = true;

    const loop = (now) => {
        const t = Math.min((now - startTime) / 2000, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // 2. Parallax Focus Weight (Original Logic)
        const focusWeight = Math.pow(ease, 2);

        // Shader Updates (Forward: 0 -> 18.0)
        torusMat.uniforms.uStretch.value = ease * 18.0;
        torusMat.uniforms.uTemperature.value = CONFIG.minTemp + (ease * 3.0);

        // Asset Swap
        gridMat.uniforms.uOpacity.value = ease;
        starsMat.uniforms.uOpacity.value = ease;

        // Camera Position
        camera.position.lerpVectors(startCamPos, endCamPos, ease);

        // Camera Rotation (Damped "Chase" Logic)
        const dummy = camera.clone();
        dummy.position.copy(camera.position);
        const currentFocus = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 0, 0), initialLookAt, focusWeight);
        dummy.lookAt(currentFocus);
        camera.quaternion.slerp(dummy.quaternion, 0.1);

        if (t < 1) requestAnimationFrame(loop);
        else {
            STATE.phase = 'TIMELINE'; STATE.transitioning = false;
            document.getElementById('hud').style.opacity = 1;
        }
    };
    requestAnimationFrame(loop);
}

export function initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup) {
    if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
    STATE.phase = 'TRANSITION'; STATE.transitioning = true;
    document.getElementById('hud').style.opacity = 0;

    const startTime = performance.now();

    const startCamPos = camera.position.clone();
    const endCamPos = new THREE.Vector3(0, 0, 50);

    const loop = (now) => {
        const t = Math.min((now - startTime) / 2000, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const invEase = 1 - ease;

        // Shader Updates (Reverse: 18.0 -> 0)
        torusMat.uniforms.uStretch.value = invEase * 18.0;

        // Asset Swap
        gridMat.uniforms.uOpacity.value = invEase;
        starsMat.uniforms.uOpacity.value = invEase;

        // Camera Position
        camera.position.lerpVectors(startCamPos, endCamPos, ease);

        // Camera Rotation (Damped "Chase" Logic to Origin)
        const dummy = camera.clone();
        dummy.position.copy(camera.position);
        dummy.lookAt(0, 0, 0);
        camera.quaternion.slerp(dummy.quaternion, 0.1);

        if (t < 1) requestAnimationFrame(loop);
        else {
            STATE.phase = 'HERO';
            STATE.transitioning = false;
            document.getElementById('ui-hero').style.opacity = 1;
            STATE.targetScrollY = 0;
            STATE.scrollY = 0;
            nodeGroup.visible = false;
        }
    };
    requestAnimationFrame(loop);
}
