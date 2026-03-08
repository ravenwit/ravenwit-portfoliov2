import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import potrace from 'potrace';

const inDir = 'icons_demo';
const outDir = 'public/icons';

const targets = {
    "Adobe Photoshop": "Adobe_Photoshop_CC_2026_icon.svg.png",
    "Adobe Lightroom": "Adobe_Lightroom_CC_2026_icon.svg.png",
    "Adobe Premiere Pro": "Adobe_Premiere_Pro_CC_2026_icon.svg.png",
    "Microsoft Visual Basic 6.0": "vb.png",
    "Visual Studio": "vs.png",
    "Rubik's Cube": "rubiks cube.png"
};

const categoryColors = {
    "Adobe Photoshop": "#8A2387",
    "Adobe Lightroom": "#8A2387",
    "Adobe Premiere Pro": "#8A2387",
    "Microsoft Visual Basic 6.0": "#fc4a1a",
    "Visual Studio": "#fc4a1a",
    "Rubik's Cube": "#ed4264"
};

function traceImage(inputPath) {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await Jimp.read(inputPath);
            // resize and threshold
            image.resize({ w: 200 })
                .greyscale()
                .contrast(0.8);

            const buffer = await image.getBuffer('image/png');

            const params = {
                color: 'currentColor',
                background: 'transparent',
                optCurve: true,
                optTolerance: 0.2,
                turdSize: 20
            };

            potrace.trace(buffer, params, (err, svgObj) => {
                if (err) return reject(err);
                let pathD = '';
                const paths = svgObj.match(/<path[^>]*>/g);
                if (paths) {
                    pathD = paths.map(p => {
                        const match = p.match(/d="([^"]+)"/);
                        return match ? match[1] : '';
                    }).join(' ');
                }
                const wMatch = svgObj.match(/width="([^"]+)"/);
                const hMatch = svgObj.match(/height="([^"]+)"/);
                let rawW = 200, rawH = 200;
                if (wMatch && hMatch) {
                    rawW = parseFloat(wMatch[1]);
                    rawH = parseFloat(hMatch[1]);
                }
                resolve({ d: pathD, rawW, rawH });
            });
        } catch (e) {
            reject(e);
        }
    });
}

(async () => {
    for (const [name, filename] of Object.entries(targets)) {
        try {
            const inputPath = path.join(inDir, filename);
            const { d, rawW, rawH } = await traceImage(inputPath);

            const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
            const filePath = path.join(outDir, fileName);
            const strokeColor = categoryColors[name] || "#ffffff";

            // Scale to fit within a 60x60 inner box (to keep away from 100x100 edges)
            const scale = 50 / Math.max(rawW, rawH);
            const ex = 50 - (rawW * scale) / 2;
            const ey = 50 - (rawH * scale) / 2;

            const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="90" height="90" rx="20" fill="none" stroke="${strokeColor}" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="4 4"/>
  <g transform="translate(${ex}, ${ey}) scale(${scale})">
    <path d="${d}" fill="${strokeColor}" />
  </g>
</svg>`;

            fs.writeFileSync(filePath, svgContent);
            console.log(`Vectorized & updated: ${fileName}`);
        } catch (e) {
            console.error(`Error processing ${name}:`, e.message);
        }
    }
})();
