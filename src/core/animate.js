import * as THREE from 'three';
import { Timer } from 'three';
import { CAREER_NODES, CONFIG } from '../config.js';
import { STATE } from '../state.js';
import { scene, camera, renderer, composer } from '../core/scene.js';
import { updateScroll } from '../core/scroll.js';
import { updateHobbies } from '../components/hobbies.js';
import { initiateResearchTransition } from './transitions.js';
import { researchMaterialUniforms, evaluateResearchParticleMath, researchParticle, researchNormalArrow, baseResearchMesh, researchLights, researchRenderer, researchScene, researchCamera, researchControls } from '../components/researchTopology.js';
import { animateResearchBG, researchMouse } from '../components/researchBackground.js';
import { updateResearchCards } from '../components/researchCards.js';

const timer = new Timer();
let autonomousParticleU = 0.0;
const particleOmega = 0.25;

export function startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath, researchMesh) {
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

            // Trigger research transition earlier: ~0.82 corresponds to Z=-1460,
            // which is immediately after passing the final 2026 career node (Z=-1400).
            if (pathProgress > 0.75) {
                initiateResearchTransition(torusMat, gridMat, starsMat, nodeGroup, researchMesh);
                return;
            }
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

            // Speedometer logic: Map 0-1 v_norm to -90 to +90 degrees
            const needle = document.getElementById('speedo-needle');
            if (needle) {
                const angle = (v_norm * 180) - 90;
                needle.style.transform = `rotate(${angle}deg)`;
            }

            // Interpolate Current Year based on Camera Z position traversing CAREER_NODES
            if (CAREER_NODES.length > 1) {
                let currentYear = 2025; // Default fallback

                // Helper to parse dates fallback into a target year Number
                // We'll use the "start" date for the node's temporal anchor
                const parseYear = (dateStr) => {
                    if (!dateStr) return 2025;
                    if (dateStr.toString().toLowerCase().includes('present')) return new Date().getFullYear();
                    const yearNum = parseInt(dateStr, 10);
                    return isNaN(yearNum) ? 2025 : yearNum;
                };

                const camZ = camera.position.z;

                // Check edge cases (beyond first or last node)
                if (camZ >= CAREER_NODES[0].z) {
                    currentYear = parseYear(CAREER_NODES[0].time_range ? CAREER_NODES[0].time_range.start : CAREER_NODES[0].date);
                } else if (camZ <= CAREER_NODES[CAREER_NODES.length - 1].z) {
                    const lastNode = CAREER_NODES[CAREER_NODES.length - 1];
                    const lastYear = parseYear(lastNode.time_range ? lastNode.time_range.start : lastNode.date);

                    // We established 1 Year = -100 Z units previously in timeline.json
                    const zUnitsPerYear = 100;
                    const distancePastFinalNode = Math.abs(camZ - lastNode.z);
                    const extrapolatedYear = lastYear + (distancePastFinalNode / zUnitsPerYear);

                    // User explicitly requested a hard limit at 2027
                    currentYear = Math.min(extrapolatedYear, 2027);
                } else {
                    // Find which segment the camera is in
                    for (let i = 0; i < CAREER_NODES.length - 1; i++) {
                        const nodeA = CAREER_NODES[i];
                        const nodeB = CAREER_NODES[i + 1];

                        // Z values are negative and decreasing: nodeA.z > nodeB.z
                        if (camZ <= nodeA.z && camZ > nodeB.z) {
                            const totalDistance = nodeB.z - nodeA.z;
                            const currentDistance = camZ - nodeA.z;
                            const progress = currentDistance / totalDistance;

                            const yrAStr = nodeA.time_range ? nodeA.time_range.start : nodeA.date;
                            const yrBStr = nodeB.time_range ? nodeB.time_range.start : nodeB.date;

                            const yearA = parseYear(yrAStr);
                            const yearB = parseYear(yrBStr);

                            currentYear = yearA + (yearB - yearA) * progress;
                            break;
                        }
                    }
                }
                const yearEl = document.getElementById('current-year');
                if (yearEl) yearEl.innerText = Math.floor(currentYear);

                updateHobbies(Math.floor(currentYear));
            }

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
                        // el.style.flexDirection = "row-reverse";
                        // el.querySelector('.node-connector').style.background = "linear-gradient(-90deg, #0ff, transparent)";
                        // el.classList.add('is-reverse');
                        el.style.flexDirection = "row";
                        el.querySelector('.node-connector').style.background = "linear-gradient(90deg, #0ff, transparent)";
                        el.classList.remove('is-reverse');
                    } else {
                        el.style.flexDirection = "row";
                        el.querySelector('.node-connector').style.background = "linear-gradient(90deg, #0ff, transparent)";
                        el.classList.remove('is-reverse');
                    }
                }
            });
        }

        if (torusMat.visible !== false && STATE.phase !== 'RESEARCH') {
            torusMat.uniforms.uNoiseTime.value += dt * (0.1 + STATE.temperature * 0.05);
            torusMat.uniforms.uTemperature.value = STATE.temperature;
            torusMat.uniforms.uTime.value = time;
        }

        if (STATE.phase === 'RESEARCH' && !STATE.transitioning) {
            // --- SCROLL INERTIA & DAMPENING ---
            STATE.researchScrollY += STATE.researchVelocity;
            STATE.researchVelocity *= 0.92; // Fluid friction
            if (Math.abs(STATE.researchVelocity) < 0.0001) STATE.researchVelocity = 0;

            const targetScroll = Math.max(0.0, Math.min(STATE.researchScrollY, 11.0));
            const decay = 5.0;

            // Apply critically damped spring lerp
            STATE.researchScrollY += (targetScroll - STATE.researchScrollY) * (1.0 - Math.exp(-decay * dt));

            // KAIZEN: Absolute physical boundary enforcement. 
            // Aggressive reverse scroll impulses can mathematically drag the lerp into negative space 
            // before the transition fires. This hard clamp prevents the GLSL shader from ever receiving -0.0
            if (STATE.researchScrollY < 0.0) {
                STATE.researchScrollY = 0.0;
                STATE.researchVelocity = 0.0;
            }

            // Update Topology Shader
            researchMaterialUniforms.uScroll.value = STATE.researchScrollY;

            // Kaizen: Subtle rotation
            researchMesh.rotation.y += 0.02 * dt;
            researchMesh.rotation.x += 0.007 * dt;
            researchMesh.rotation.z = Math.sin(time * 0.3) * 0.05;

            // Autonomous Particle Physics
            if (STATE.researchScrollY >= 4.0 && STATE.researchScrollY < 9.5) {
                researchParticle.visible = true; researchNormalArrow.visible = true;

                let particleScale = 1.0;
                if (STATE.researchScrollY > 8.0) particleScale = Math.max(0, 1.0 - (STATE.researchScrollY - 8.0));

                researchParticle.scale.set(particleScale, particleScale, particleScale);
                researchNormalArrow.setLength(Math.max(0.01, 1.5 * particleScale), 0.3 * particleScale, 0.2 * particleScale);

                autonomousParticleU = (autonomousParticleU + particleOmega * dt) % 2.0;
                let pu = autonomousParticleU; let pv = 0.5;

                const pData = evaluateResearchParticleMath(pu, pv, 4.0);
                researchParticle.position.copy(pData.pos);

                const dr = 0.001;
                const Tu = new THREE.Vector3().subVectors(evaluateResearchParticleMath(pu + dr, pv, 4.0).pos, pData.pos);
                const Tv = new THREE.Vector3().subVectors(evaluateResearchParticleMath(pu, pv + dr, 4.0).pos, pData.pos);
                researchNormalArrow.position.copy(pData.pos);
                researchNormalArrow.setDirection(new THREE.Vector3().crossVectors(Tu, Tv).normalize());

                document.getElementById('hud-omega').innerText = (particleOmega * particleScale).toFixed(2) + " rad/s";
            } else {
                researchParticle.visible = false; researchNormalArrow.visible = false;
                autonomousParticleU = 0.0;
                document.getElementById('hud-omega').innerText = "0.00 rad/s";
            }

            // Update DOM Elements
            updateResearchCards(STATE.researchScrollY);

            // Pipe chronological clock time down into the 2D Wave Generator to restore the ripples
            animateResearchBG(time);

            document.getElementById('hud-s').innerText = STATE.researchScrollY.toFixed(2);
            let phaseText = "MORPHING";
            if (STATE.researchScrollY <= 0.5) phaseText = "TORUS";
            if (STATE.researchScrollY >= 10.8) phaseText = "TORUS";
            if (STATE.researchScrollY >= 4.0 && STATE.researchScrollY < 9.0) phaseText = "MÖBIUS";
            // else if (STATE.researchScrollY >= 9.0) phaseText = "KLEIN TOPOLOGY";
            document.getElementById('hud-phase').innerText = phaseText;

            // Pan Camera Centering Mechanics matching original HTML CSS transform rules
            let panProgress = 0;
            if (STATE.researchScrollY > 8.0) panProgress = Math.min(1.0, STATE.researchScrollY - 8.0);
            let easedPan = panProgress * panProgress * (3.0 - 2.0 * panProgress);
            const leftHemi = document.getElementById('left-hemi');
            if (leftHemi) leftHemi.style.transform = `translateX(${easedPan * 25}vw)`;
        }

        // Critical Render Pass 2: The separated 50vw WebGL layer for the Topology
        // This must run outside the 'RESEARCH' phase lock so it renders smoothly while scaling up during the 'TRANSITION' phase!
        if (baseResearchMesh && baseResearchMesh.visible) {
            if (researchControls) researchControls.update();
            if (researchRenderer && researchScene && researchCamera) {
                researchRenderer.render(researchScene, researchCamera);
            }
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
