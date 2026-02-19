// --- Geometry Worker ---
// Offloads heavy buffer computation to a background thread.
// Accepts { type, config } messages and returns Float32Arrays as transferable.

self.onmessage = function (e) {
    const { type, config } = e.data;

    switch (type) {
        case 'torus': {
            const R = 35, r = 12, count = 40000;
            const positions = new Float32Array(count * 3);
            const randoms = new Float32Array(count);
            for (let i = 0; i < count; i++) {
                const u = Math.random() * Math.PI * 2;
                const v = Math.random() * Math.PI * 2;
                const i3 = i * 3;
                positions[i3] = (R + r * Math.cos(v)) * Math.cos(u);
                positions[i3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
                positions[i3 + 2] = r * Math.sin(v);
                randoms[i] = Math.random();
            }
            self.postMessage({ type, positions, randoms }, [positions.buffer, randoms.buffer]);
            break;
        }

        case 'grid': {
            const { gridZStart, gridZEnd, gridWidth, gridDensity } = config;
            const temp = [];
            for (let z = gridZStart; z > gridZEnd; z -= gridDensity) {
                for (let x = -gridWidth / 2; x < gridWidth / 2; x += gridDensity) {
                    temp.push(x, 0, z);
                }
            }
            const positions = new Float32Array(temp);
            self.postMessage({ type, positions }, [positions.buffer]);
            break;
        }

        case 'stars': {
            const count = 15000;
            const positions = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 800;
                positions[i3 + 1] = (Math.random() - 0.5) * 800;
                positions[i3 + 2] = (Math.random() - 0.5) * 1000;
                sizes[i] = 0.5 + Math.random() * 1.5;
            }
            self.postMessage({ type, positions, sizes }, [positions.buffer, sizes.buffer]);
            break;
        }
    }
};
