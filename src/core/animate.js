import * as THREE from 'three';
import { Timer } from 'three';
import { CONFIG, CAREER_NODES } from '../config.js';
import { STATE } from '../state.js';
import { scene, camera, renderer, composer } from '../core/scene.js';
import { updateScroll } from '../core/scroll.js';

const timer = new Timer();

export function startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath) {
    function animate(timestamp) {
        requestAnimationFrame(animate);
        timer.update(timestamp);
        updateScroll(timestamp);
        const dt = timer.getDelta(); const time = timer.getElapsed();

        if (STATE.phase === 'LOADING') {
            // Preloader updates are now handled in main.js during initialization.
            // This loop only handles visual cooling/spin once loadProgress is 100.
            document.getElementById('progress-bar').style.width = `${STATE.loadProgress}%`;

            if (STATE.loadProgress >= 100) {
                if (STATE.temperature > CONFIG.minTemp) {
                    STATE.temperature *= CONFIG.coolingRate;
                } else {
                    STATE.temperature = CONFIG.minTemp;
                    STATE.phase = 'HERO';
                    document.getElementById('ui-loader').style.opacity = 0;
                    setTimeout(() => document.getElementById('ui-hero').style.opacity = 1, 1000);
                    const start = camera.position.clone();
                    const target = new THREE.Vector3(0, 0, 50);
                    let tt = 0;
                    const hLoop = () => {
                        tt += 0.02;
                        camera.position.lerpVectors(start, target, tt);
                        if (tt < 1) requestAnimationFrame(hLoop);
                    };
                    hLoop();
                    document.getElementById('status-display').innerText = "SYSTEM_READY";
                }
            }
            torusMesh.rotation.z += 0.002;
        }
        else if (STATE.phase === 'HERO' && !STATE.transitioning) {
            torusMesh.rotation.z += 0.001;

            // Baseline passive breath
            let targetX = Math.sin(time * 0.5) * 1.5;
            let targetY = Math.cos(time * 0.3) * 1.5;

            // Direct Mouse Parallax (same direction as mouse implies pushing deeper)
            if (STATE.mouse) {
                targetX += STATE.mouse.x * 8.0; // Increased from 3.0
                targetY += STATE.mouse.y * 8.0;
            }

            // Smooth interpolation
            camera.position.x += (targetX - camera.position.x) * 0.05;
            camera.position.y += (targetY - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);
        }
        else if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {

            const diff = STATE.targetScrollY - STATE.scrollY;
            STATE.scrollY += diff * CONFIG.scrollDamping;
            STATE.velocity = diff * CONFIG.scrollDamping;

            const pathProgress = Math.min(Math.max(STATE.scrollY / 8000, 0), 1.0);
            const camPos = cameraPath.getPointAt(pathProgress);
            const lookPos = cameraPath.getPointAt(Math.min(pathProgress + 0.01, 1.0));

            camera.position.copy(camPos);
            camera.position.y += Math.sin(time * 0.5) * 0.5;
            camera.lookAt(lookPos);
            const xTurn = (lookPos.x - camPos.x);
            camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -xTurn * 0.8, 0.1);

            const v_norm = Math.min(Math.abs(STATE.velocity) / CONFIG.c_sim, 0.999);
            STATE.coordinateTime += dt; STATE.properTime += dt / (1.0 / Math.sqrt(1.0 - v_norm * v_norm));
            document.getElementById('coord-time').innerText = STATE.coordinateTime.toFixed(2);
            document.getElementById('proper-time').innerText = STATE.properTime.toFixed(2);
            document.getElementById('velocity').innerText = v_norm.toFixed(2) + "c";
            document.getElementById('lorentz').innerText = (1.0 / Math.sqrt(1.0 - v_norm * v_norm)).toFixed(3);

            if (v_norm > 0.9) { document.getElementById('velocity-alert').style.display = 'block'; camera.position.x += (Math.random() - 0.5) * 0.5; }
            else document.getElementById('velocity-alert').style.display = 'none';

            nodeGroup.children.forEach((wrapper, i) => {
                const node = CAREER_NODES[i];
                if (!node) return;

                if (wrapper.children[0]) wrapper.children[0].scale.setScalar((12 + node.mass * 1.5) + Math.sin(time * 2 + i) * 2);
                if (wrapper.children[2]) wrapper.children[2].rotation.z -= 0.002;

                const nodePos = wrapper.position.clone(); nodePos.y += 30 + (node.mass * 2); nodePos.project(camera);
                const x = (nodePos.x * .5 + .5) * window.innerWidth;
                const y = -(nodePos.y * .5 - .5) * window.innerHeight;

                if (wrapper.children[3]) {
                    wrapper.children[3].rotation.y -= 0.005;
                    wrapper.children[3].children.forEach((child, ci) => {
                        if (ci > 0) {
                            child.position.y = Math.sin(time * 2 + child.userData.phase) * 1.5;
                            child.children[0].rotation.x += 0.01;
                            child.children[0].rotation.z += 0.005;
                            child.children[1].rotation.x -= 0.02;

                            // Calculate screen coords for the skill label overlay
                            const satPos = new THREE.Vector3();
                            child.getWorldPosition(satPos);
                            satPos.project(camera);
                            const sx = (satPos.x * .5 + .5) * window.innerWidth;
                            const sy = -(satPos.y * .5 - .5) * window.innerHeight;

                            const skillEl = document.getElementById(`skill-${i}-${ci - 1}`);
                            if (skillEl) skillEl.style.transform = `translate(${sx - x}px, ${sy - y}px)`;
                        }
                    });
                }


                const el = node.element;
                const dist = camera.position.distanceTo(new THREE.Vector3(node.x, 0, node.z));

                if ((node.z - camera.position.z) > 10) el.style.display = 'none';
                else {
                    el.style.display = 'flex';
                    if (dist < 120) {
                        el.querySelector('.hud-card').classList.remove('minimized');
                        el.style.opacity = 1; el.style.zIndex = 100;
                        el.style.transform = `translate(${x}px, ${y}px) scale(1)`;
                    } else if (dist < 400) {
                        const card = el.querySelector('.hud-card');
                        if (!card.classList.contains('expanded')) card.classList.add('minimized');
                        el.style.opacity = Math.max(0.2, 1.0 - ((dist - 120) / 280));
                        el.style.zIndex = 50; el.style.transform = `translate(${x}px, ${y}px) scale(0.8)`;
                    } else el.style.display = 'none';

                    if (node.x < 0) {
                        el.style.flexDirection = "row-reverse";
                        el.querySelector('.node-connector').style.background = "linear-gradient(-90deg, #0ff, transparent)";
                        el.classList.add('is-reverse');
                    } else {
                        el.style.flexDirection = "row";
                        el.querySelector('.node-connector').style.background = "linear-gradient(90deg, #0ff, transparent)";
                        el.classList.remove('is-reverse');
                    }
                }
            });
        }

        if (torusMat.visible !== false) {
            torusMat.uniforms.uNoiseTime.value += dt * (0.1 + STATE.temperature * 0.05);
            torusMat.uniforms.uTemperature.value = STATE.temperature;
            torusMat.uniforms.uTime.value = time;
        }
        gridMat.uniforms.uTime.value = time;
        starsMat.uniforms.uTime.value = time;
        starsMat.uniforms.uCameraZ.value = camera.position.z;
        starsMat.uniforms.uSpeed.value = STATE.velocity;
        starsMat.uniforms.uCameraPos.value.copy(camera.position);
        composer.render();
    }

    animate();
}
