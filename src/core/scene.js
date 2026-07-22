import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 0, 90);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Post-processing ---
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.4,  // strength — subtle glow, not overblown
    0.6,  // radius
    0.6   // threshold — only bright fragments bloom
);
composer.addPass(bloom);

export function initRenderer() {
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

// --- GeoFNO Works Renderer (Separate WebGL context) ---
export const geofnoScene = new THREE.Scene();
export const geofnoCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
geofnoCamera.position.set(0, 0, 6);

export let geofnoRenderer = null;
export let geofnoControls = null;

export async function initGeofnoRenderer(container) {
    geofnoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    geofnoRenderer.setSize(container.clientWidth, container.clientHeight);
    geofnoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    geofnoCamera.aspect = container.clientWidth / container.clientHeight;
    geofnoCamera.position.z = geofnoCamera.aspect < 1.0 ? 10 : 6;
    geofnoCamera.updateProjectionMatrix();

    container.appendChild(geofnoRenderer.domElement);
    
    // Controls
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    geofnoControls = new OrbitControls(geofnoCamera, geofnoRenderer.domElement);
    geofnoControls.enablePan = false;
    geofnoControls.maxDistance = 12;
    geofnoControls.minDistance = 3;
    geofnoControls.autoRotate = false;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(10, 10, 10);
    const dirLight2 = new THREE.DirectionalLight(0x4466ff, 0.5);
    dirLight2.position.set(-5, -5, -5);
    geofnoScene.add(ambientLight, dirLight1, dirLight2);
    
    return geofnoRenderer;
}

export function clearGeofnoRenderer() {
    if (geofnoRenderer) {
        geofnoRenderer.dispose();
        geofnoRenderer = null;
    }
    if (geofnoControls) {
        geofnoControls.dispose();
        geofnoControls = null;
    }
}

export function setupResize() {
    window.addEventListener('resize', () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        
        // Update GeoFNO renderer if active
        if (geofnoRenderer) {
            const container = document.getElementById('geofno-container');
            if (container && container.style.display !== 'none') {
                const cw = container.clientWidth;
                const ch = container.clientHeight;
                geofnoCamera.aspect = cw / ch;
                geofnoCamera.position.z = (cw / ch) < 1.0 ? 10 : 6;
                geofnoCamera.updateProjectionMatrix();
                geofnoRenderer.setSize(cw, ch);
            }
        }
    });
}
