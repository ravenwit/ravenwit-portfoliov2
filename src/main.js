// --- Spacetime Portfolio | Modular Entry Point ---

import * as THREE from 'three';
import { STATE } from './state.js';
import { scene, camera, renderer, initRenderer, setupResize } from './core/scene.js';
import { buildCameraPath } from './core/cameraPath.js';
import { generateGeometry } from './core/geometryManager.js';
import { createNodes, toggleCard, startTypingInterval } from './components/nodes.js';

import { startAnimationLoop } from './core/animate.js';
import { initScroll, computeSnapTargets, jumpToMilestone } from './core/scroll.js';

import { setTransitionDeps, initiateHeroToTimeline, initiateHeroToWorks, initiateTimelineToHero, initiateWorksToHero, initiateResearchToHero, navigateToSector, syncDockUI } from './core/transitions.js';
import { CAREER_NODES } from './config.js';
import { initHobbies } from './components/hobbies.js';
import { initResearchTopology } from './components/researchTopology.js';
import { initResearchCards } from './components/researchCards.js';
import { terminal } from './components/terminal.js';
import { createVortex } from './components/vortexSingularity.js';
import { initWorksCarousel } from './components/worksSection.js';
import { initReadmeOverlay } from './components/readmeOverlay.js';

async function init() {
    const statusDisp = document.getElementById('status-display');
    const updateLoading = (stage, progress) => {
        STATE.loadStage = stage;
        STATE.loadProgress = progress;
        if (statusDisp) statusDisp.innerText = stage;
        console.log(`[INIT] ${stage}: ${progress}%`);
    };

    window.addEventListener('click', (e) => {
        console.log("Global click registered on:", e.target, e.target.id, e.target.className);
    });

    // --- 0. FETCH DATA ---
    updateLoading('FETCHING_DATA', 5);
    try {
        const res = await fetch('/data/timeline.json');
        const timelineData = await res.json();

        let currentZ = -50;
        timelineData.filter(item => item.category === 'career').forEach((item, index) => {
            item.x = index % 2 === 0 ? 25 : -30;
            item.y = 0;
            item.z = currentZ;

            // Algorithmic spacing based on node mass
            currentZ -= (90 + item.mass * 15);

            CAREER_NODES.push(item);
        });
    } catch (e) {
        console.error("Failed to load timeline data: ", e);
    }

    // --- 1. INIT RENDERER (10%) ---
    initRenderer();
    updateLoading('RENDERER_READY', 10);

    // --- 2-4. GENERATE GEOMETRY (WEB WORKER) ---
    let torusMesh, torusMat, gridMesh, gridMat, starField, starsMat;
    const geometryObjects = await generateGeometry(
        (type, count) => {
            const map = { 'torus': 30, 'grid': 55, 'stars': 75 };
            const stageMap = { 'torus': 'TORUS_GENERATED', 'grid': 'GRID_GENERATED', 'stars': 'STARS_GENERATED' };
            if (map[type]) updateLoading(stageMap[type], map[type]);
        },
        (torusData) => {
            torusMesh = torusData.torusMesh;
            torusMat = torusData.torusMat;
            scene.add(torusMesh);

            // Start preloader spin 
            let preloaderFrame;
            function preLoaderLoop(time) {
                if (window.mainLoopStarted) {
                    cancelAnimationFrame(preloaderFrame);
                    return;
                }
                preloaderFrame = requestAnimationFrame(preLoaderLoop);
                torusMesh.rotation.z += 0.002;
                const dt = 0.016;
                torusMat.uniforms.uNoiseTime.value += dt * (0.1 + STATE.temperature * 0.05);
                torusMat.uniforms.uTemperature.value = STATE.temperature;
                torusMat.uniforms.uTime.value = time * 0.001;
                renderer.render(scene, camera);
            }
            preloaderFrame = requestAnimationFrame(preLoaderLoop);
        }
    );

    gridMesh = geometryObjects.gridMesh;
    gridMat = geometryObjects.gridMat;
    starField = geometryObjects.starField;
    starsMat = geometryObjects.starsMat;

    scene.add(gridMesh);
    scene.add(starField);

    // --- 5. CREATE NODES (15%) ---
    const nodeGroup = createNodes(gridMat);
    scene.add(nodeGroup);
    updateLoading('NODES_READY', 90);

    const researchMesh = initResearchTopology();
    // Hide research initially
    researchMesh.visible = false;

    // --- 6. CAMERA PATH (5%) ---
    const cameraPath = buildCameraPath();
    computeSnapTargets(cameraPath);
    updateLoading('COMPUTING_TRAJECTORY', 95);

    // --- 7. SHADER WARMUP (5%) ---
    renderer.compile(scene, camera);
    updateLoading('SYSTEM_WARMUP', 100);

    // --- 8. STORE TRANSITION DEPS ---
    setTransitionDeps({
        torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath, researchMesh
    });

    // --- 9. START LOGIC ---
    startTypingInterval();
    setupResize();

    // Lenis Smooth Scroll
    initScroll();

    // --- TRACK MOUSE FOR PARALLAX ---
    STATE.mouse = new THREE.Vector2(0, 0);
    const fourierContainer = document.getElementById('fourier-container');
    const liquidContainer = document.getElementById('liquid-name-container');

    window.addEventListener('mousemove', (event) => {
        STATE.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        STATE.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (fourierContainer) {
            const xOffset = -STATE.mouse.x * 5;
            const yOffset = STATE.mouse.y * 5;
            fourierContainer.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
        }

        if (liquidContainer) {
            const lxOffset = -STATE.mouse.x * 8;
            const lyOffset = STATE.mouse.y * 8;
            liquidContainer.style.transform = `translate(calc(-50% + ${lxOffset}px), calc(-50% + ${lyOffset}px))`;
        }
    });

    // Initialize Fourier Canvas & Social Quanta
    import('./components/fourier.js').then(module => {
        module.initFourier('fourierCanvas');
    });

    import('./components/liquidTypography.js').then(module => {
        module.initLiquidTypography('liquidNameCanvas');
    });

    import('./components/orbitalBeads.js').then(module => {
        module.initOrbitalBeads();
    });

    initHobbies();
    initResearchCards();
    import('./components/playgroundSection.js').then(m => m.initPlayground());

    // Attach Telemetry for terminal `htop` command
    terminal.telemetryCallback = () => {
        return {
            fps: STATE.currentFPS || 60,
            calls: renderer.info.render.calls,
            geometries: renderer.info.memory.geometries,
            triangles: renderer.info.render.triangles
        };
    };

    // --- 10. PERSISTENT GLOBAL COMMAND DOCK (Awwwards 3D Architecture) ---
    const navHeroBtn = document.getElementById('nav-btn-hero');
    const navTimelineBtn = document.getElementById('nav-btn-timeline');
    const navWorksBtn = document.getElementById('nav-btn-works');
    const navArchiveBtn = document.getElementById('nav-btn-archive');
    const navPlaygroundBtn = document.getElementById('nav-btn-playground');
    const navTerminalBtn = document.getElementById('nav-btn-terminal');

    if (navHeroBtn) navHeroBtn.addEventListener('click', () => navigateToSector('HERO'));
    if (navTimelineBtn) navTimelineBtn.addEventListener('click', () => navigateToSector('TIMELINE'));
    if (navWorksBtn) navWorksBtn.addEventListener('click', () => navigateToSector('WORKS'));
    if (navArchiveBtn) navArchiveBtn.addEventListener('click', () => navigateToSector('RESEARCH'));
    if (navPlaygroundBtn) navPlaygroundBtn.addEventListener('click', () => navigateToSector('PLAYGROUND'));
    if (navTerminalBtn) navTerminalBtn.addEventListener('click', () => {
        if (terminal && terminal.toggle) terminal.toggle();
    });

    // Global Keyboard Hotkeys: H, T, W, A, P, ~ (CLI)
    window.addEventListener('keydown', (event) => {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (STATE.transitioning) return;

        const key = event.key.toLowerCase();
        if (key === 'h') {
            navigateToSector('HERO');
        } else if (key === 't') {
            navigateToSector('TIMELINE');
        } else if (key === 'w') {
            navigateToSector('WORKS');
        } else if (key === 'a') {
            navigateToSector('RESEARCH');
        } else if (key === 'p') {
            navigateToSector('PLAYGROUND');
        } else if (event.key === '`' || event.key === '~') {
            event.preventDefault();
            if (terminal && terminal.toggle) terminal.toggle();
        }
    });

    // Sync dock UI periodically or on state updates
    setInterval(() => {
        if (STATE.phase !== 'LOADING' && STATE.phase !== 'TRANSITION') {
            syncDockUI(STATE.phase);
        }
    }, 200);

    // --- 11. INIT WORKS CAROUSEL & README OVERLAY ---
    initWorksCarousel();
    initReadmeOverlay();

    // --- 12. WIRE BACK BUTTONS ---
    const timelineBackBtn = document.getElementById('timeline-back');
    if (timelineBackBtn) {
        timelineBackBtn.addEventListener('click', initiateTimelineToHero);
    }

    const worksBackBtn = document.getElementById('works-back');
    if (worksBackBtn) {
        worksBackBtn.addEventListener('click', initiateWorksToHero);
    }

    const researchBackBtn = document.getElementById('research-back');
    if (researchBackBtn) {
        researchBackBtn.addEventListener('click', initiateResearchToHero);
    }

    // Show/hide timeline back button based on phase
    function updateTimelineBackBtn() {
        if (timelineBackBtn) {
            if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
                timelineBackBtn.style.opacity = '1';
                timelineBackBtn.style.pointerEvents = 'auto';
            } else {
                timelineBackBtn.style.opacity = '0';
                timelineBackBtn.style.pointerEvents = 'none';
            }
        }
    }
    setInterval(updateTimelineBackBtn, 200);

    // Populate Radar Nodes + Scale Ticks
    const timelineNodesContainer = document.getElementById('timeline-nodes');
    const roundNodesContainer = document.getElementById('radar-round-nodes');
    if (timelineNodesContainer && CAREER_NODES.length > 0) {
        
        const parseYearFraction = (dateStr) => {
            if (!dateStr) return 2025;
            if (dateStr.toString().toLowerCase().includes('present')) return new Date().getFullYear();
            const parts = dateStr.toString().split('-');
            const year = parseInt(parts[0], 10);
            if (isNaN(year)) return 2025;
            if (parts.length > 1) {
                const month = parseInt(parts[1], 10);
                if (!isNaN(month)) return year + ((month - 1) / 12);
            }
            return year;
        };

        CAREER_NODES.forEach(n => {
            n.timeVal = parseYearFraction(n?.time_range?.start || n?.date);
        });

        const sortedNodes = [...CAREER_NODES].sort((a,b) => a.timeVal - b.timeVal);

        const getZForTime = (t) => {
            if (t <= sortedNodes[0].timeVal) {
                return sortedNodes[0].z + ((sortedNodes[0].timeVal - t) * 100);
            }
            const last = sortedNodes[sortedNodes.length-1];
            if (t >= last.timeVal) {
                return last.z - ((t - last.timeVal) * 100);
            }
            
            for(let i=0; i<sortedNodes.length-1; i++) {
                const nA = sortedNodes[i];
                const nB = sortedNodes[i+1];
                if (t >= nA.timeVal && t <= nB.timeVal) {
                    const denom = nB.timeVal - nA.timeVal;
                    if (denom === 0) return nA.z;
                    const progress = (t - nA.timeVal) / denom;
                    return nA.z + progress * (nB.z - nA.z);
                }
            }
            return sortedNodes[0].z;
        };

        const findUForZ = (targetZ) => {
            let bestU = 0;
            let minDiff = Infinity;
            for(let i = 0; i <= 2000; i++) {
                let u = i / 2000;
                let pt = cameraPath.getPointAt(u);
                let diff = Math.abs(pt.z - targetZ);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestU = u;
                }
            }
            return bestU;
        };

        CAREER_NODES.forEach((node, index) => {
            const bestU = findUForZ(node.z);
            const marker = document.createElement('div');
            marker.className = 'radar-node';
            marker.style.top = `${bestU * 100}%`;
            marker.setAttribute('title', `EVT-0${index + 1}: ${node.title} (${node.time_range ? node.time_range.start : node.date})`);
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                jumpToMilestone(index);
            });
            timelineNodesContainer.appendChild(marker);

            if(roundNodesContainer) {
                const pt = cameraPath.getPointAt(bestU);
                const roundMarker = document.createElement('div');
                roundMarker.className = 'radar-round-marker';
                roundMarker.setAttribute('title', `EVT-0${index + 1}: ${node.title} (${node.time_range ? node.time_range.start : node.date})`);
                roundMarker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    jumpToMilestone(index);
                });
                
                const mapScale = 0.15;
                roundMarker.style.left = `${pt.x * mapScale}px`;
                roundMarker.style.top = `${pt.z * mapScale}px`;
                
                roundMarker.dataset.x = pt.x * mapScale;
                roundMarker.dataset.y = pt.z * mapScale;
                
                roundNodesContainer.appendChild(roundMarker);
            }
        });
        
        if (roundNodesContainer) {
            for (let i = 0; i < 40; i++) {
                const star = document.createElement('div');
                star.className = 'radar-star';
                const ox = (Math.random() * 60 - 30);
                const oy = (Math.random() * 240 - 230);
                star.style.left = `${ox}px`;
                star.style.top = `${oy}px`;
                star.dataset.x = ox;
                star.dataset.y = oy;
                roundNodesContainer.appendChild(star);
            }
        }

        let minYear = Math.floor(Math.min(...sortedNodes.map(n => n.timeVal)));
        let maxYear = Math.ceil(Math.max(...sortedNodes.map(n => n.timeVal)));
        minYear = Math.max(1990, minYear - 1); 
        maxYear = Math.min(2030, maxYear + 1);

        for (let y = minYear; y <= maxYear; y++) {
            for(let q = 0; q < 4; q++) {
                const timeVal = y + (q * 0.25);
                const targetZ = getZForTime(timeVal);
                const bestU = findUForZ(targetZ);
                
                if (bestU <= 0.001 || bestU >= 0.999) continue;

                const tick = document.createElement('div');
                const isMajor = (q === 0);
                tick.className = isMajor ? 'radar-tick tick-major' : 'radar-tick tick-minor';
                tick.style.top = `${bestU * 100}%`;
                
                if (isMajor) {
                    const label = document.createElement('span');
                    label.className = 'tick-label';
                    label.innerText = y;
                    tick.appendChild(label);
                }
                
                timelineNodesContainer.appendChild(tick);
            }
        }
    }

    // --- 13. START ANIMATION LOOP ---
    startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath, researchMesh);
}

// Start Initialization
init().catch(err => {
    console.error("Critical System Failure during initialization:", err);
    const statusDisp = document.getElementById('status-display');
    if (statusDisp) statusDisp.innerText = "FATAL_ERROR";
});