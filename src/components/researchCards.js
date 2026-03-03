export const RESEARCH_DATA = [
    { id: "RES-01", title: "Wavelet-Based CNNs", desc: "Integration of Discrete Wavelet Transforms into Convolutional Neural Networks to prevent high-frequency spatial information loss during max-pooling. Achieved higher compression efficiency.", tags: ["Python", "TensorFlow", "Signal Processing"] },
    { id: "RES-02", title: "Quantum Monte Carlo", desc: "Path integral formulation mapping a d-dimensional quantum system to a (d+1)-dimensional classical system. Visualized bosonic exchange and topological reconnections.", tags: ["C++", "Quantum Mechanics", "Statistical Physics"] },
    { id: "RES-03", title: "Tensor Networks (MPS)", desc: "Matrix Product States for compressing exponentially large quantum Hilbert spaces. Performed Singular Value Decomposition (SVD) truncation on internal entanglement bonds.", tags: ["Julia", "Linear Algebra", "Many-Body Physics"] },
    { id: "RES-04", title: "Neutrino Oscillation", desc: "Wigner Monte Carlo simulation of neutrino flavor state superpositions propagating through space, tracking the phase shift governed by the PMNS matrix.", tags: ["Fortran", "Particle Physics", "Monte Carlo"] },
    { id: "RES-05", title: "Ising Phase Transitions", desc: "Simulation of spontaneous symmetry breaking and the divergence of correlation length near a critical temperature in a 3D lattice array.", tags: ["C++", "Statistical Mechanics", "Phase Transitions"] }
];

export function initResearchCards() {
    const container = document.getElementById('research-cards-container');
    if (!container) return;

    RESEARCH_DATA.forEach((data, i) => {
        const numStr = (i + 1).toString().padStart(2, '0');
        container.innerHTML += `
            <div class="research-card" id="res-card-${i}">
                <div class="editorial-number">${numStr}</div>
                <div class="res-card-content">
                    <div class="res-card-header">${data.id}</div>
                    <div class="res-card-title">${data.title}</div>
                    <div class="res-card-body">${data.desc}</div>
                    <div class="res-card-tags">${data.tags.map(t => `<span class="res-tag">${t}</span>`).join('')}</div>
                </div>
            </div>
        `;
    });
}

export function updateResearchCards(currentScroll) {
    const cards = document.querySelectorAll('.research-card');
    cards.forEach((card, i) => {
        const triggerPoint = 1.5 + i * 1.0;
        const diff = currentScroll - triggerPoint;

        const isEven = i % 2 === 0;
        card.style.width = isEven ? '80%' : '65%';
        card.style.left = isEven ? '0' : 'auto';
        card.style.right = isEven ? 'auto' : '0';

        const baseTilt = isEven ? -2 : 3;

        if (diff < 0) {
            // IN THE MESSY DECK
            const stackDepth = Math.abs(diff);
            const clampedDepth = Math.min(stackDepth, 3);

            const yOffset = 250 + (clampedDepth * 40);
            const zOffset = -100 * clampedDepth;

            const xOffset = isEven ? -(clampedDepth * 20) : (clampedDepth * 20);
            const rotateZ = baseTilt + (isEven ? -clampedDepth * 2 : clampedDepth * 2);

            card.style.transform = `translate3d(${xOffset}px, calc(-50% + ${yOffset}px), ${zOffset}px) rotateZ(${rotateZ}deg)`;
            card.style.opacity = 1.0 - (clampedDepth * 0.25);
            card.style.zIndex = 10 - Math.floor(stackDepth);
            card.style.pointerEvents = 'auto';

        } else if (diff < 1.0) {
            // ACTIVE TO PAST (Floating up with parallax)
            const yOffset = -300 * diff;
            const xOffset = isEven ? -10 * diff : 15 * diff;
            const opacity = 1.0 - diff;

            card.style.transform = `translate3d(${xOffset}px, calc(-50% + ${yOffset}px), 0px) rotateZ(${baseTilt}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = 10;
            card.style.pointerEvents = 'auto';
        } else {
            // ARCHIVED
            card.style.opacity = 0;
            card.style.pointerEvents = 'none';
        }
    });
}
