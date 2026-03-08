import fs from 'fs';
import path from 'path';
import * as simpleIcons from 'simple-icons';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hobbiesFile = 'public/data/hobbies.json';
const outDir = 'public/icons';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// 1. Read JSON file
const rawData = fs.readFileSync(hobbiesFile, 'utf8');
const dataStr = rawData.substring(rawData.indexOf('['), rawData.lastIndexOf(']') + 1);
let hobbies;
try {
    hobbies = eval(`(${dataStr})`);
} catch (e) {
    hobbies = JSON.parse(dataStr);
}

// 2. Constants for theming and aliasing
const categoryColors = {
    "THEORETICAL PHYSICS": ["#8e2de2", "#4a00e0"],
    "PURE MATHEMATICS": ["#00c6ff", "#0072ff"],
    "ARTIFICIAL INTELLIGENCE & DATA": ["#f12711", "#f5af19"],
    "CYBERSECURITY & NETWORKING": ["#11998e", "#38ef7d"],
    "SOFTWARE DEVELOPMENT": ["#fc4a1a", "#f7b733"],
    "OS & DEV TOOLS": ["#8A2387", "#E94057"],
    "ARTS, DESIGN & HOBBIES": ["#ed4264", "#ffedbc"]
};

const aliases = {
    "Node.js": "nodedotjs",
    "HTML": "html5",
    "JavaScript": "javascript",
    "Red Hat Linux": "redhat",
    "MS Office Suite": "microsoftoffice",
    "C++": "cplusplus",
    ".NET Framework": "dotnet",
    "Vue": "vuedotjs",
    "React": "react",
    "Math": "mathworks",
    "C": "c",
    "Sagemath": "sagemath",
    "Sympy": "python",
    "Ubuntu": "ubuntu",
    "Debian": "debian",
    "CentOS": "centos",
    "Arch Linux": "archlinux",
    "Manjaro": "manjaro",
    "Git": "git",
    "PHP": "php",
    "Laravel": "laravel",
    "jQuery": "jquery",
    "OpenCV": "opencv",
    "Pandas": "pandas",
    "Scikit-learn": "scikitlearn",
    "TensorFlow": "tensorflow",
    "Keras": "keras",
    "Numpy": "numpy",
    "Scipy": "scipy",
    "Metasploit": "metasploit",
    "Wireshark": "wireshark",
    "Figma": "figma",
    "LaTeX": "latex",
    "Gatsby": "gatsby",
    "MATLAB": "matlab",
    "PyCharm": "pycharm",
    "Qt Framework": "qt",
    "Arduino IDE": "arduino",
    "Linux Server Administration": "linux"
};

// --- Custom Geometry Vector SVGs for Special Tools ---

function getRubiksPaths(color) {
    let p = '';
    const cx = 50, cy = 55, dx = 26, dy = 15;
    const c = [cx, cy], t = [cx, cy - 2 * dy], b = [cx, cy + 2 * dy];
    const tr = [cx + dx, cy - dy], br = [cx + dx, cy + dy];
    const tl = [cx - dx, cy - dy], bl = [cx - dx, cy + dy];

    p += `<polygon points="${t[0]},${t[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${b[0]},${b[1]} ${bl[0]},${bl[1]} ${tl[0]},${tl[1]}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>\n`;
    p += `<polyline points="${t[0]},${t[1]} ${c[0]},${c[1]} ${bl[0]},${bl[1]}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>\n`;
    p += `<line x1="${c[0]}" y1="${c[1]}" x2="${br[0]}" y2="${br[1]}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>\n`;

    const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>\n`;
    const lerp = (p1, p2, val) => [p1[0] + (p2[0] - p1[0]) * val, p1[1] + (p2[1] - p1[1]) * val];

    p += line(...lerp(tl, c, 1 / 3), ...lerp(bl, b, 1 / 3)) + line(...lerp(tl, c, 2 / 3), ...lerp(bl, b, 2 / 3));
    p += line(...lerp(c, b, 1 / 3), ...lerp(tl, bl, 1 / 3)) + line(...lerp(c, b, 2 / 3), ...lerp(tl, bl, 2 / 3));
    p += line(...lerp(c, tr, 1 / 3), ...lerp(b, br, 1 / 3)) + line(...lerp(c, tr, 2 / 3), ...lerp(b, br, 2 / 3));
    p += line(...lerp(c, b, 1 / 3), ...lerp(tr, br, 1 / 3)) + line(...lerp(c, b, 2 / 3), ...lerp(tr, br, 2 / 3));
    p += line(...lerp(tl, t, 1 / 3), ...lerp(c, tr, 1 / 3)) + line(...lerp(tl, t, 2 / 3), ...lerp(c, tr, 2 / 3));
    p += line(...lerp(t, tr, 1 / 3), ...lerp(tl, c, 1 / 3)) + line(...lerp(t, tr, 2 / 3), ...lerp(tl, c, 2 / 3));
    return p;
}

function getAdobePaths(letters, color) {
    return `<rect x="25" y="25" width="50" height="50" rx="10" fill="none" stroke="${color}" stroke-width="3" />
  <text x="50" y="55" font-family="'Inter', 'Segoe UI', sans-serif" font-size="28" font-weight="bold" fill="none" stroke="${color}" stroke-width="1.5" text-anchor="middle" dominant-baseline="middle">${letters}</text>`;
}

function getVisualStudioPaths(color) {
    return `<path d="M 28 35 L 43 45 L 28 55 Z" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 72 25 L 43 45 L 72 75 L 85 65 L 85 35 Z" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 28 35 L 15 42 L 15 48 L 28 55" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
  <line x1="28" y1="35" x2="72" y2="75" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
  <line x1="28" y1="55" x2="72" y2="25" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
}

function getVisualBasicPaths(color) {
    return `<path d="M 30,50 C 30,30 50,30 50,50 C 50,70 70,70 70,50 C 70,30 50,30 50,50 C 50,70 30,70 30,50 Z" fill="none" stroke="${color}" stroke-width="3"/>
  <text x="50" y="55" font-family="'Inter', 'Segoe UI', sans-serif" font-size="16" font-weight="bold" fill="none" stroke="${color}" stroke-width="1" text-anchor="middle" dominant-baseline="middle">VB</text>`;
}

function getIconBySlug(slug) {
    if (!slug) return null;
    const exportName = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
    return simpleIcons[exportName] || null;
}

// 3. Generate SVGs
hobbies.forEach(category => {
    const [color1, color2] = categoryColors[category.category] || ["#2b5876", "#4e4376"];

    category.items.forEach(item => {
        const nameStr = item.name;
        const strokeColor = color1;
        let customPath = null;
        let isCustom = false;

        if (nameStr === "Rubik's Cube") { customPath = getRubiksPaths(strokeColor); isCustom = true; }
        else if (nameStr.startsWith("Adobe ")) {
            let letters = "Ad";
            if (nameStr.includes("Photoshop")) letters = "Ps";
            if (nameStr.includes("Lightroom")) letters = "Lr";
            if (nameStr.includes("Premiere Pro")) letters = "Pr";
            customPath = getAdobePaths(letters, strokeColor);
            isCustom = true;
        }
        else if (nameStr === "Visual Studio") { customPath = getVisualStudioPaths(strokeColor); isCustom = true; }
        else if (nameStr === "Microsoft Visual Basic 6.0" || nameStr === "Visual Basic") { customPath = getVisualBasicPaths(strokeColor); isCustom = true; }

        let slug = aliases[item.name] || item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const iconData = getIconBySlug(slug);

        let innerContent = '';
        if (isCustom) {
            innerContent = customPath;
        } else if (iconData) {
            innerContent = `
  <g transform="translate(25, 25) scale(2.083)">
    <path d="${iconData.path}" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-linejoin="round" />
  </g>`;
        } else {
            const words = item.name.split(' ');
            const letters = words.length > 1 && words[1][0]
                ? (words[0][0] + words[1][0]).toUpperCase()
                : item.name.substring(0, 2).toUpperCase();

            innerContent = `
  <text x="50" y="55" font-family="'Inter', 'Segoe UI', sans-serif" font-size="36" font-weight="bold" fill="none" stroke="${strokeColor}" stroke-width="2" text-anchor="middle" dominant-baseline="middle">${letters}</text>`;
        }

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
${innerContent}
</svg>`;

        const fileName = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, svgContent);
        console.log(`Generated: ${fileName}`);
    });
});
