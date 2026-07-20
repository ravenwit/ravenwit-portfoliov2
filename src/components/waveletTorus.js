import * as THREE from 'three';

export class WaveletTorus {
    constructor() {
        this.group = new THREE.Group();
        this.group.visible = false;
        
        // Configuration from wavelet cnn torus.html
        this.bandsInfo = {
            LL: { color: 0x4488ff, size: 0.15, offset: new THREE.Vector3(-18, 18, 0), sparseFactor: 1, opacity: 0.6 },
            HL: { color: 0xff4444, size: 0.25, offset: new THREE.Vector3(18, 18, 0),  sparseFactor: 4, opacity: 0.9 }, 
            LH: { color: 0x44ff44, size: 0.25, offset: new THREE.Vector3(-18, -18, 0), sparseFactor: 4, opacity: 0.9 }, 
            HH: { color: 0xffff44, size: 0.30, offset: new THREE.Vector3(18, -18, 0),  sparseFactor: 8, opacity: 1.0 }  
        };

        this.pointSystems = {};
        this.init();
    }

    init() {
        const geometry = new THREE.TorusGeometry(12, 4, 80, 200);
        const basePositions = geometry.attributes.position.array;
        const particleCount = basePositions.length / 3;

        Object.keys(this.bandsInfo).forEach(key => {
            const info = this.bandsInfo[key];
            const bandGeo = new THREE.BufferGeometry();
            const posArray = [];

            for (let i = 0; i < particleCount; i++) {
                if (i % info.sparseFactor === 0) {
                    posArray.push(basePositions[i * 3], basePositions[i * 3 + 1], basePositions[i * 3 + 2]);
                }
            }

            bandGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
            
            const material = new THREE.PointsMaterial({
                color: info.color,
                size: info.size,
                transparent: true,
                opacity: 0, // Start invisible
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const points = new THREE.Points(bandGeo, material);
            this.group.add(points);
            this.pointSystems[key] = points;
        });

        // The Convolutional Kernel (Sweeper)
        const kernelGeo = new THREE.BoxGeometry(45, 45, 1);
        const kernelMat = new THREE.MeshBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0, wireframe: true });
        this.kernel = new THREE.Mesh(kernelGeo, kernelMat);
        this.kernel.visible = false;
        this.group.add(this.kernel);
    }

    update(time) {
        if (!this.group.visible) return;
        this.group.rotation.x += 0.001;
        this.group.rotation.y += 0.002;
    }

    show() {
        this.group.visible = true;
    }

    reset() {
        Object.keys(this.pointSystems).forEach(key => {
            this.pointSystems[key].position.set(0, 0, 0);
            this.pointSystems[key].material.opacity = 0;
        });
        this.kernel.visible = false;
        this.kernel.material.opacity = 0;
    }
}
