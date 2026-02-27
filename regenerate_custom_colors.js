import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hobbiesFile = 'public/data/hobbies.json';
const inDir = 'output_vectors';
const outDir = 'public/icons';

const rawData = fs.readFileSync(hobbiesFile, 'utf8');
const dataStr = rawData.substring(rawData.indexOf('['), rawData.lastIndexOf(']') + 1);
let hobbies;
try {
    hobbies = eval(`(${dataStr})`);
} catch (e) {
    hobbies = JSON.parse(dataStr);
}

// Map HTML UI colors to categories for consistency
const categoryColors = {
    "THEORETICAL PHYSICS": "#d8b4fe", // Neon Purple
    "PURE MATHEMATICS": "#60a5fa",    // Neon Blue
    "ARTIFICIAL INTELLIGENCE & DATA": "#f87171", // Neon Red
    "CYBERSECURITY & NETWORKING": "#4ade80", // Neon Green
    "SOFTWARE DEVELOPMENT": "#fbbf24", // Neon Yellow
    "OS & DEV TOOLS": "#f472b6", // Assigning pink as fallback for tools
    "ARTS, DESIGN & HOBBIES": "#f472b6" // Neon Pink
};

const filenameMapping = {
    "Matplotlib.svg.svg": "Matplotlib",
    "ads-cft.svg": "AdS/CFT Correspondence",
    "aircrack ng.svg": "Aircrack-ng",
    "beef.svg": "BeEF",
    "category.svg": "Category Theory",
    "cryptography.svg": "Cryptography",
    "dnsspoof.svg": "Dnsspoof",
    "electronics.svg": "Robotics",
    "eliptic cruve.svg": "Elliptic Curves",
    "ettercap__.svg": "Ettercap",
    "ettercap.svg": "Ettercap",
    "gdb.svg": "Gdb",
    "grave-wave.svg": "Gravitational Waves",
    "hexdump.svg": "Hexdump",
    "holograhic principle.svg": "Holographic Principle",
    "kalimba.svg": "Kalimba",
    "kirigimi.svg": "Kirigami",
    "matlab.svg": "MATLAB",
    "ms office.svg": "MS Office Suite",
    "neural-network.svg": "Neural Networks",
    "origami.svg": "Origami",
    "paper-crafts.svg": "Paper Crafts",
    "phase transition.svg": "Phase Transitions",
    "poker-game.svg": "Cardistry",
    "renormalization.svg": "Renormalization",
    "renormalizaton__.svg": "Renormalization",
    "violin.svg": "Violin",
    "vscode.svg": "VS Code",
    "gan.svg": "Adversarial Generative Networks (GANs)",
    "movies.svg": "Movies",
    "music.svg": "Music",
    "quantum error correction.svg": "Quantum Error Correction"
};

const nameToColorList = {};
hobbies.forEach(category => {
    const color = categoryColors[category.category] || "#ffffff";
    category.items.forEach(item => {
        nameToColorList[item.name] = color;
    });
});

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(inDir).filter(f => f.endsWith('.svg'));
let count = 0;

for (const file of files) {
    const itemName = filenameMapping[file];
    if (!itemName) continue;

    const strokeColor = nameToColorList[itemName] || "#ffffff";
    const absolutePath = path.join(inDir, file);
    const content = fs.readFileSync(absolutePath, 'utf8');

    let innerContentContext = '';
    const match = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) {
        innerContentContext = match[1];
    } else {
        innerContentContext = content;
    }

    // Strip out the vtracer 'blob' fills and convert them strictly into neon wireframes!
    innerContentContext = innerContentContext.replace(/fill="([^"]+)"/g, `fill="none"`);
    // If the path already has a stroke, replace its color, otherwise add it.
    if (innerContentContext.includes('stroke=')) {
        innerContentContext = innerContentContext.replace(/stroke="([^"]+)"/g, `stroke="${strokeColor}"`);
    } else {
        innerContentContext = innerContentContext.replace(/<path /g, `<path stroke="${strokeColor}" stroke-width="1.5" stroke-linecap="round" `);
    }

    // Also, if opacity is too low, strip it so the neon colors glow cleanly
    innerContentContext = innerContentContext.replace(/opacity="[^"]+"/g, '');
    innerContentContext = innerContentContext.replace(/fill-opacity="[^"]+"/g, '');
    innerContentContext = innerContentContext.replace(/stroke-opacity="[^"]+"/g, '');

    let rawW = 100, rawH = 100;
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].split(/[ ,]+/);
        if (parts.length === 4) {
            rawW = parseFloat(parts[2]);
            rawH = parseFloat(parts[3]);
        }
    } else {
        const wMatch = content.match(/width="([^"]+)"/i);
        const hMatch = content.match(/height="([^"]+)"/i);
        if (wMatch && hMatch) {
            rawW = parseFloat(wMatch[1].replace(/[^0-9.]/g, ''));
            rawH = parseFloat(hMatch[1].replace(/[^0-9.]/g, ''));
        }
    }

    const scale = 50 / Math.max(rawW, rawH);
    const ex = 50 - (rawW * scale) / 2;
    const ey = 50 - (rawH * scale) / 2;

    const outFileName = `${itemName.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    const outFilePath = path.join(outDir, outFileName);

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${ex}, ${ey}) scale(${scale})">
    ${innerContentContext}
  </g>
</svg>`;

    fs.writeFileSync(outFilePath, svgContent);
    count++;
}

console.log(`Done! Re-colored and wrapped ${count} SVGs into public/icons.`);
