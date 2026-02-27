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

const rawData = fs.readFileSync(hobbiesFile, 'utf8');
const dataStr = rawData.substring(rawData.indexOf('['), rawData.lastIndexOf(']') + 1);
const hobbies = eval(`(${dataStr})`);

// Mappings for custom aliases
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

const categoryColors = {
    "THEORETICAL PHYSICS": ["#8e2de2", "#4a00e0"],
    "PURE MATHEMATICS": ["#00c6ff", "#0072ff"],
    "ARTIFICIAL INTELLIGENCE & DATA": ["#f12711", "#f5af19"],
    "CYBERSECURITY & NETWORKING": ["#11998e", "#38ef7d"],
    "SOFTWARE DEVELOPMENT": ["#fc4a1a", "#f7b733"],
    "OS & DEV TOOLS": ["#8A2387", "#E94057"],
    "ARTS, DESIGN & HOBBIES": ["#ed4264", "#ffedbc"]
};

// ... other generators omitted for brevity as we just want to ensure strings are generated correctly

function getIconBySlug(slug) {
    if (!slug) return null;
    const exportName = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
    return simpleIcons[exportName] || null;
}

let count = 0;
const expectedFiles = [];

hobbies.forEach(category => {
    const [color1, color2] = categoryColors[category.category] || ["#2b5876", "#4e4376"];

    category.items.forEach(item => {
        let strokeColor = color1;
        let customPath = null;
        let isCustom = false;
        let slug = aliases[item.name] || item.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        const iconData = getIconBySlug(slug);
        const fileName = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
        expectedFiles.push(fileName);
        const filePath = path.join(outDir, fileName);

        let innerContent = '';

        if (iconData) {
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
  <rect x="5" y="5" width="90" height="90" rx="20" fill="none" stroke="${strokeColor}" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="4 4"/>
${innerContent}
</svg>`;

        fs.writeFileSync(filePath, svgContent);
        count++;
    });
});

console.log(`Generated ${count} files. Checking if they exist on disk:`);
const existing = fs.readdirSync(outDir);
const missing = expectedFiles.filter(f => !existing.includes(f));
if (missing.length > 0) {
    console.log('Missing:', missing);
} else {
    console.log('All files successfully persisted.');
}
