export const CONFIG = {
    c_sim: 120, scrollDamping: 0.06, coolingRate: 0.96, minTemp: 0.005,
    gridZStart: 100, gridZEnd: -800, gridWidth: 400, gridDensity: 0.8,
    massStrength: 15.0, lensingStrength: 120.0
};

export const CAREER_NODES = [
    {
        x: 25, y: 0, z: -50, mass: 1.5,
        title: "ACADEMIC RESEARCH", subtitle: "Quantum Optics Systems", date: "2021-2022",
        skills: ["MATLAB", "Lasers", "Polarization"],
        responsibilities: ["SIMULATING PHOTON ENTANGLEMENT", "OPTIMIZING LASER ARRAYS", "PUBLISHING RESEARCH DATA"]
    },
    {
        x: -30, y: 0, z: -160, mass: 3.25,
        title: "CERN FELLOWSHIP", subtitle: "High Energy Particle Tracking", date: "2023",
        skills: ["C++", "ROOT", "Linux", "Data Analysis"],
        responsibilities: ["ANALYZING COLLIDER EVENTS", "MAINTAINING GRID CLUSTERS", "DEVELOPING TRACKING ALGORITHMS"]
    },
    {
        x: 20, y: 0, z: -280, mass: 5.0,
        title: "MASTER'S THESIS", subtitle: "Topological Defects in Spacetime", date: "2024",
        skills: ["Python", "Diff. Geometry", "LaTeX", "Topology"],
        responsibilities: ["DERIVING FIELD EQUATIONS", "VISUALIZING MANIFOLD TOPOLOGY", "DEFENDING THESIS DISSERTATION"]
    },
    {
        x: -15, y: 0, z: -420, mass: 2.25,
        title: "FULL STACK ENG", subtitle: "High-Performance WebGL Systems", date: "2025",
        skills: ["React", "Three.js", "WebGL", "Node.js"],
        responsibilities: ["BUILDING IMMERSIVE UI", "OPTIMIZING SHADER PIPELINES", "DEPLOYING CLOUD INFRASTRUCTURE"]
    }
];
