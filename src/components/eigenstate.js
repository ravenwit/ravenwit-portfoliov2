import { STATE } from '../state.js';
import * as THREE from 'three';
import { camera } from '../core/scene.js';

let containerElement = null;
let gridElement = null;
let itemElements = [];

export function initEigenstates(timelineData) {
    containerElement = document.getElementById('eigenstate-grid-container');
    gridElement = document.getElementById('eigenstate-grid');

    if (!containerElement || !gridElement) {
        console.warn("Eigenstate DOM containers not found.");
        return;
    }

    // Filter hobbies from timeline data
    const hobbyData = timelineData.filter(item => item.category === 'hobby');

    // Generate DOM
    hobbyData.forEach((hobby, idx) => {
        const typeClass = hobby.persisting ? 'stable' : 'transient';

        const el = document.createElement('div');
        el.className = `eigenstate-item ${typeClass}`;
        el.id = `eigenstate-${hobby.id}`;

        const title = document.createElement('div');
        title.className = 'eigenstate-title';
        title.innerText = hobby.title;

        const desc = document.createElement('div');
        desc.className = 'eigenstate-desc';
        desc.innerText = hobby.description || '';

        const time = document.createElement('div');
        time.className = 'eigenstate-time';
        time.innerText = hobby.date || '';

        el.appendChild(title);
        el.appendChild(desc);
        el.appendChild(time);

        gridElement.appendChild(el);
        itemElements.push(el);
    });
}

// Dynamically sync scroll and camera data to DOM Transform
export function updateEigenstateGrid() {
    if (!containerElement || !gridElement || STATE.phase !== 'TIMELINE') {
        if (containerElement && containerElement.style.opacity !== '0') {
            containerElement.style.opacity = '0';
        }
        return;
    }

    // The grid appears throughout the timeline phase
    // Wait until transition finishes to avoid clashing UI
    if (STATE.transitioning) {
        containerElement.style.opacity = '0';
        return;
    }

    // Parallax logic & active state triggering
    const scrollY = STATE.targetScrollY || 0;

    // We make it active almost immediately after entering timeline
    if (scrollY > 10) {
        if (containerElement.style.opacity !== '1') {
            containerElement.style.opacity = '1';
            // Trigger entry animations for all items
            itemElements.forEach(item => item.classList.add('active'));
        }
    } else {
        if (containerElement.style.opacity !== '0') {
            containerElement.style.opacity = '0';
            // Turn off animations when hidden
            itemElements.forEach(item => item.classList.remove('active'));
        }
    }

    // Calculate light reactive tilt and pan using Camera's rotation 
    if (camera) {
        // Subtle tilt based on camera rotation.x
        // Base tilt 15 degrees + dynamic tilt
        const baseTilt = 15;
        const dynamicTilt = (camera.rotation.x * THREE.MathUtils.RAD2DEG) * 0.3;
        const tiltX = baseTilt + dynamicTilt;

        const panY = scrollY * -0.05; // Light parallax pan moving upwards

        gridElement.style.transform = `rotateX(${tiltX}deg) translateY(${panY}px)`;
    }
}
