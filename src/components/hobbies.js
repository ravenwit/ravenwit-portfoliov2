import * as THREE from 'three';

const ICON_MAP = {
    'AdS/CFT Correspondence': '/icons/AdS_CFT_Correspondence.svg',
    'Holographic Principle': '/icons/Holographic_Principle.svg',
    'Gravitational Waves': '/icons/Gravitational_Waves.svg',
    'Quantum Error Correction': '/icons/Quantum_Error_Correction.svg',
    'Phase Transitions': '/icons/Phase_Transitions.svg',
    'Renormalization': '/icons/Renormalization.svg',
    'Category Theory': '/icons/Category_Theory.svg',
    'Elliptic Curves': '/icons/Elliptic_Curves.svg',
    'Sympy': '/icons/Sympy.svg',
    'Sagemath': '/icons/Sagemath.svg',
    'Adversarial Generative Networks (GANs)': '/icons/Adversarial_Generative_Networks__GANs_.svg',
    'Neural Networks': '/icons/Neural_Networks.svg',
    'Keras': '/icons/Keras.svg',
    'TensorFlow': '/icons/TensorFlow.svg',
    'Scipy': '/icons/Scipy.svg',
    'Numpy': '/icons/Numpy.svg',
    'Pandas': '/icons/Pandas.svg',
    'Scikit-learn': '/icons/Scikit_learn.svg',
    'OpenCV': '/icons/OpenCV.svg',
    'Matplotlib': '/icons/Matplotlib.svg',
    'Cryptography': '/icons/Cryptography.svg',
    'Metasploit': '/icons/Metasploit.svg',
    'Wireshark': '/icons/Wireshark.svg',
    'Linux Server Administration': '/icons/Linux_Server_Administration.svg',
    'bash': '/icons/bash.svg',
    'Aircrack-ng': '/icons/Aircrack_ng.svg',
    'BeEF': '/icons/BeEF.svg',
    'Ettercap': '/icons/Ettercap.svg',
    'Hexdump': '/icons/Hexdump.svg',
    'Node.js': '/icons/Node_js.svg',
    'Gatsby': '/icons/Gatsby.svg',
    'HTML': '/icons/HTML.svg',
    'JavaScript': '/icons/JavaScript.svg',
    'PHP': '/icons/PHP.svg',
    'Laravel': '/icons/Laravel.svg',
    '.NET Framework': '/icons/_NET_Framework.svg',
    'C': '/icons/C.svg',
    'C++': '/icons/C__.svg',
    'Qt Framework': '/icons/Qt_Framework.svg',
    'Arduino IDE': '/icons/Arduino_IDE.svg',
    'Git': '/icons/Git.svg',
    'LaTeX': '/icons/LaTeX.svg',
    'VS Code': '/icons/VS_Code.svg',
    'Arch Linux': '/icons/Arch_Linux.svg',
    'Ubuntu': '/icons/Ubuntu.svg',
    'Violin': '/icons/Violin.svg',
    'Origami': '/icons/Origami.svg',
    'Kirigami': '/icons/Kirigami.svg',
    'Paper Crafts': '/icons/Paper_Crafts.svg',
    'Rubik\'s Cube': '/icons/Rubik_s_Cube.svg',
    'Adobe Photoshop': '/icons/Adobe_Photoshop.svg',
    'Music': '/icons/Music.svg',
    'Movies': '/icons/Movies.svg',
    'Kalimba': '/icons/Kalimba.svg',
    'Arpspoof': '/icons/Arpspoof.svg',
    'CentOS': '/icons/CentOS.svg',
    'Debian': '/icons/Debian.svg',
    'Dnsspoof': '/icons/Dnsspoof.svg',
    'Gdb': '/icons/Gdb.svg',
    'Manjaro': '/icons/Manjaro.svg',
    'Red Hat Linux': '/icons/Red_Hat_Linux.svg',
    'Robotics': '/icons/Robotics.svg',
    'jQuery': '/icons/jQuery.svg',
    'MATLAB': '/icons/MATLAB.svg',
    'Microsoft Visual Basic 6.0': '/icons/Microsoft_Visual_Basic_6_0.svg',
    'MS Office Suite': '/icons/MS_Office_Suite.svg',
    'PyCharm': '/icons/PyCharm.svg',
    'Visual Studio': '/icons/Visual_Studio.svg',
    'Cardistry': '/icons/Cardistry.svg',
    'Adobe Lightroom': '/icons/Adobe_Lightroom.svg',
    'Adobe Premiere Pro': '/icons/Adobe_Premiere_Pro.svg',
    'Figma': '/icons/Figma.svg',
    'THEORETICAL PHYSICS': '/icons/category_physics.svg',
    'PURE MATHEMATICS': '/icons/category_math.svg',
    'MACHINE LEARNING & DATA SCIENCE': '/icons/category_ml_data.svg',
    'SECURITY & SYSTEMS': '/icons/category_security.svg',
    'SOFTWARE DEVELOPMENT': '/icons/category_dev.svg',
    'ARTS': '/icons/category_arts.svg',
    'MUSIC': '/icons/category_music.svg'
};

const getIcon = (name) => ICON_MAP[name] || '';
const getCatClass = (catId) => `cat-${catId}`;

let allAreas = [];
let allTools = [];
let rootCategories = [];

const START_YEAR = 2004;
const END_YEAR = 2027;

const gridStateAreas = Array(36).fill(null);
const gridStateTools = Array(36).fill(null);
const gridStateCat = Array(49).fill(null);

const activeAreas = {};
const activeTools = {};
const activeCategories = {};

const DIAG_6x6 = [0, 7, 14, 21, 28, 35];
const DIAG_7x7 = [0, 8, 16, 24, 32, 40, 48];

function getAvailableCatCell() {
    const available = gridStateCat.map((val, idx) => val === null ? idx : null)
        .filter(idx => idx !== null && DIAG_7x7.includes(idx));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

function getAvailableItemCell(gridState, is6x6) {
    const forbiddenDiags = is6x6 ? DIAG_6x6 : [];
    const available = gridState.map((val, idx) => val === null ? idx : null)
        .filter(idx => idx !== null && !forbiddenDiags.includes(idx));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

export function initHobbies() {
    const matrixAreasEl = document.getElementById('matrix-areas');
    const matrixToolsEl = document.getElementById('matrix-tools');
    const matrixCatEl = document.getElementById('matrix-categories');

    if (!matrixAreasEl || !matrixToolsEl || !matrixCatEl) return;

    for (let i = 0; i < 36; i++) {
        let c1 = document.createElement('div'); c1.className = 'cell'; matrixAreasEl.appendChild(c1);
        let c2 = document.createElement('div'); c2.className = 'cell'; matrixToolsEl.appendChild(c2);
    }
    for (let i = 0; i < 49; i++) {
        let c3 = document.createElement('div'); c3.className = 'cell'; matrixCatEl.appendChild(c3);
    }

    fetch('/data/hobbies.json')
        .then(res => res.json())
        .then(data => {
            data.forEach(cat => {
                rootCategories.push({
                    name: cat.category,
                    id: cat.id,
                    catId: cat.id,
                    isShortTerm: false
                });

                if (cat.items) {
                    cat.items.forEach(item => {
                        const start = parseInt(item.time_range.start) || START_YEAR;
                        const end = item.time_range.end === "Present" ? 9999 : parseInt(item.time_range.end);
                        const parsedItem = {
                            name: item.name,
                            catId: cat.id,
                            start: start,
                            end: end,
                            duration: (end === 9999 ? 2026 : end) - start,
                            isShortTerm: ((end === 9999 ? 2026 : end) - start) < 3 && end !== 9999
                        };

                        if (item.type === 'area') {
                            allAreas.push(parsedItem);
                        } else if (item.type === 'tool') {
                            allTools.push(parsedItem);
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.error("Failed to load hobbies.json:", err);
        });

    const triptychContainer = document.getElementById('triptych-container');
    if (triptychContainer) {
        triptychContainer.addEventListener('mousemove', (e) => {
            const rect = triptychContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            const maxTilt = 5;
            const tiltX = y * maxTilt;
            const tiltY = -x * maxTilt;
            triptychContainer.style.transition = 'none';
            triptychContainer.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        triptychContainer.addEventListener('mouseleave', () => {
            triptychContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            triptychContainer.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    }
}

export function updateHobbies(year) {
    const matrixAreasEl = document.getElementById('matrix-areas');
    const matrixToolsEl = document.getElementById('matrix-tools');
    const matrixCatEl = document.getElementById('matrix-categories');

    if (!matrixAreasEl || !allAreas.length) return;

    const totalYears = END_YEAR - START_YEAR;
    const progressPct = ((year - START_YEAR) / totalYears) * 100;

    // We already update progress in the main HUD instead, 
    // but we can preserve the localized timeline-progress updates if they exist.
    const timelineProgress = document.getElementById('timeline-progress');
    if (timelineProgress) timelineProgress.style.height = `${progressPct}%`;
    const yearDisplay = document.getElementById('hobbies-year-display');
    if (yearDisplay) yearDisplay.innerText = year;

    const activeAreasItems = allAreas.filter(h => year >= h.start && year <= h.end);
    activeAreasItems.forEach(item => {
        if (!activeAreas[item.name]) {
            const idx = getAvailableItemCell(gridStateAreas, true);
            if (idx !== null) spawnItem(item, idx, gridStateAreas, activeAreas, matrixAreasEl, 6);
        }
    });
    Object.keys(activeAreas).forEach(name => {
        if (!activeAreasItems.find(h => h.name === name)) {
            mergeAndRemove(name, activeAreas, gridStateAreas, 6);
        }
    });

    const activeToolsItems = allTools.filter(h => year >= h.start && year <= h.end);
    activeToolsItems.forEach(item => {
        if (!activeTools[item.name]) {
            const idx = getAvailableItemCell(gridStateTools, true);
            if (idx !== null) spawnItem(item, idx, gridStateTools, activeTools, matrixToolsEl, 6);
        }
    });
    Object.keys(activeTools).forEach(name => {
        if (!activeToolsItems.find(h => h.name === name)) {
            mergeAndRemove(name, activeTools, gridStateTools, 6);
        }
    });

    const currentlyActiveIds = new Set();
    [...activeAreasItems, ...activeToolsItems].forEach(item => currentlyActiveIds.add(item.catId));

    rootCategories.forEach(cat => {
        const isActive = currentlyActiveIds.has(cat.id);
        if (isActive) {
            if (!activeCategories[cat.name]) {
                const idx = getAvailableCatCell();
                if (idx !== null) spawnItem(cat, idx, gridStateCat, activeCategories, matrixCatEl, 7);
            }
        } else {
            if (activeCategories[cat.name]) {
                mergeAndRemove(cat.name, activeCategories, gridStateCat, 7);
            }
        }
    });
}

function spawnItem(itemDef, cellIndex, gridState, trackingDict, matrixEl, dim) {
    const cell = matrixEl.children[cellIndex];
    if (!cell) return;
    const typeClass = itemDef.isShortTerm ? 'short-term' : 'long-term';

    const div = document.createElement('div');
    div.className = `item spawning ${getCatClass(itemDef.catId)} ${typeClass}`;
    div.innerHTML = `<span>${itemDef.name}</span>`;

    let iconPath = getIcon(itemDef.name);

    if (iconPath) {
        fetch(iconPath)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Fallback HTML returned instead of SVG");
                return res.text();
            })
            .then(svgCode => {
                if (!svgCode.includes('<svg')) return;
                let recoloredSvg = svgCode.replace(/stroke="[^"]+"/g, match => {
                    return match.includes('none') ? match : 'stroke="currentColor"';
                }).replace(/fill="[^"]+"/g, match => {
                    return match.includes('none') ? match : 'fill="currentColor"';
                });

                recoloredSvg = recoloredSvg.replace(/stroke-width="[^"]+"/g, 'stroke-width="var(--icon-stroke-width, 2.5px)"');
                recoloredSvg = recoloredSvg.replace(/<path/g, '<path vector-effect="non-scaling-stroke"');

                const parser = new DOMParser();
                const doc = parser.parseFromString(recoloredSvg, "image/svg+xml");
                const svgEl = doc.documentElement;
                svgEl.classList.add('item-icon');
                div.prepend(svgEl);
            })
            .catch(e => { });
    }

    cell.appendChild(div);
    gridState[cellIndex] = itemDef.name;
    trackingDict[itemDef.name] = {
        element: div,
        cellIndex: cellIndex,
        isShortTerm: itemDef.isShortTerm,
        name: itemDef.name
    };
}

function mergeAndRemove(name, trackingDict, gridState, dim) {
    const itemObj = trackingDict[name];
    if (!itemObj || itemObj.isExiting) return;

    itemObj.isExiting = true;
    const el = itemObj.element;
    const currentIdx = itemObj.cellIndex;

    el.classList.add('merging');
    el.classList.remove('short-term', 'long-term');
    el.style.transition = 'all 0.5s ease-in';

    requestAnimationFrame(() => {
        el.style.transform = `translate(0px, -50px) scale(0)`;
        el.style.opacity = '0';
        el.style.filter = 'blur(10px) brightness(3)';
    });

    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        gridState[currentIdx] = null;
        delete trackingDict[name];
    }, 500);
}
