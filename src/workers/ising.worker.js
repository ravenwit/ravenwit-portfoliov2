// --- 2D Ising Model Monte Carlo Simulation (Web Worker) ---
// 200×200 grid, Metropolis algorithm, checkerboard initial condition.

const N = 200;
const N2 = N * N;
let grid = new Int8Array(N2);
let T = 3.0;

function initCheckerboard() {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            grid[i * N + j] = ((i + j) % 2 === 0) ? 1 : -1;
        }
    }
}

// Metropolis sweep: attempt N2 spin flips
function doSweep() {
    for (let step = 0; step < N2; step++) {
        const idx = Math.floor(Math.random() * N2);
        const i = Math.floor(idx / N);
        const j = idx % N;
        
        // Periodic boundary conditions
        const up    = grid[((i - 1 + N) % N) * N + j];
        const down  = grid[((i + 1) % N) * N + j];
        const left  = grid[i * N + ((j - 1 + N) % N)];
        const right = grid[i * N + ((j + 1) % N)];
        
        // Energy change: ΔE = 2 * spin * (sum of neighbors)
        const dE = 2 * grid[idx] * (up + down + left + right);
        
        // Accept or reject
        if (dE < 0 || Math.random() < Math.exp(-dE / T)) {
            grid[idx] = -grid[idx];
        }
    }
}

function getMagnetization() {
    let sum = 0;
    for (let i = 0; i < N2; i++) sum += grid[i];
    return Math.abs(sum) / N2;
}

function getEnergy() {
    let E = 0;
    for (let idx = 0; idx < N2; idx++) {
        const i = Math.floor(idx / N);
        const j = idx % N;
        const right = grid[i * N + ((j + 1) % N)];
        const down  = grid[((i + 1) % N) * N + j];
        // Only count right and down neighbors to avoid double counting
        E += -grid[idx] * (right + down);
    }
    return E / N2; // Energy per spin
}

initCheckerboard();

self.onmessage = function(e) {
    if (e.data.type === 'setTemp') {
        T = e.data.value;
    } else if (e.data.type === 'reset') {
        initCheckerboard();
        const mag = getMagnetization();
        const energy = getEnergy();
        const out = new Uint8Array(N2);
        for (let i = 0; i < N2; i++) out[i] = grid[i] === 1 ? 1 : 0;
        self.postMessage({ type: 'frame', data: out.buffer, mag, energy }, [out.buffer]);
    } else if (e.data.type === 'sweep') {
        doSweep();
        const mag = getMagnetization();
        const energy = getEnergy();
        const out = new Uint8Array(N2);
        for (let i = 0; i < N2; i++) out[i] = grid[i] === 1 ? 1 : 0;
        self.postMessage({ type: 'frame', data: out.buffer, mag, energy }, [out.buffer]);
    }
};