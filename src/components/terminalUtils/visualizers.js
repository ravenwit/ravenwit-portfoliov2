// src/components/terminalUtils/visualizers.js
// Handles complex data output and hex streams, and hardware visual filters.

export function injectSVGBarrelDistortion() {
    if (document.getElementById('crt-barrel-distortion')) return;

    // Generate a 512x512 spherical normal map using a hidden canvas
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);

    // k is the distortion coefficient. Positive values create a barrel (fisheye) distortion.
    const k = 0.25;

    // Max displacement distance at corners (where r^2 = 2 on normalized [-1, 1] grid)
    const max_d = k * 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // Normalize current coordinate to [-1, 1]
            const nx = (x / size) * 2 - 1;
            const ny = (y / size) * 2 - 1;

            const r2 = nx * nx + ny * ny;

            // Calculate pixel pull inward
            let dx = nx * k * r2;
            let dy = ny * k * r2;

            // Map offset delta (-max_d .. max_d) to RGB 8-bit space (0..255)
            // 128 is center (no displacement)
            const rVal = Math.floor(((dx / max_d) * 0.5 + 0.5) * 255);
            const gVal = Math.floor(((dy / max_d) * 0.5 + 0.5) * 255);

            const index = (y * size + x) * 4;
            imgData.data[index + 0] = rVal; // Red channel dictates X displacement
            imgData.data[index + 1] = gVal; // Green channel dictates Y displacement
            imgData.data[index + 2] = 0;
            imgData.data[index + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    const svgStr = `
        <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; width: 0; height: 0;">
            <defs>
                <filter id="crt-barrel-distortion" x="-20%" y="-20%" width="140%" height="140%">
                    <feImage href="${dataUrl}" result="map" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" />
                    <feDisplacementMap in="SourceGraphic" in2="map" scale="70" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    `;

    const div = document.createElement('div');
    div.innerHTML = svgStr;
    document.body.appendChild(div);
}

export function cmdHexdump(args, terminal) {
    const filename = args.length > 0 ? args[0] : 'sys.mem';
    terminal.printHistory(`hexdump ${args.join(' ')}`, `Reading raw byte stream from ${filename}... (Ctrl+C to abort)`);

    terminal.input.disabled = true;
    terminal.input.blur();

    const outBox = document.createElement('div');
    outBox.className = 'terminal-history-output';
    outBox.style.opacity = '0.9';
    terminal.historyContainer.appendChild(outBox);

    let offset = 0;
    const maxOffset = 1024 * 3; // parse 3kb
    const charsPerLine = 16;

    const hexChars = "0123456789abcdef";

    function randomHexByte() {
        return hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
    }

    function randomPrintable() {
        const charCode = Math.floor(Math.random() * (126 - 32)) + 32;
        return String.fromCharCode(charCode);
    }

    let frameId;
    let isCancelled = false;

    // Add global keydown listener to simulate Ctrl+C cancel
    const cancelListener = (e) => {
        if (e.ctrlKey && e.key === 'c') {
            isCancelled = true;
        }
    };
    document.addEventListener('keydown', cancelListener);

    const maxLinesPerFrame = 4; // Throttle rendering to budget FPS for Three.js

    function renderFrame() {
        if (isCancelled) {
            cleanup(`\n^C - Hexdump interrupted at offset 0x${offset.toString(16).padStart(8, '0')}`);
            return;
        }

        let textUpdate = '';

        for (let l = 0; l < maxLinesPerFrame; l++) {
            if (offset >= maxOffset) break;

            let line = offset.toString(16).padStart(8, '0') + "  ";

            let hexPart = '';
            let asciiPart = '';

            for (let i = 0; i < charsPerLine; i++) {
                if (offset >= maxOffset) break;

                const isRealByte = Math.random() > 0.15;
                if (isRealByte) {
                    hexPart += randomHexByte() + ' ';
                    asciiPart += ' '; // Only dots and spaces to look cleaner as random chars can break formatting occasionally
                    if (Math.random() > 0.4) {
                        asciiPart = asciiPart.slice(0, -1) + randomPrintable();
                    }
                } else {
                    hexPart += '00 ';
                    asciiPart += '.';
                }

                if (i === 7) hexPart += ' '; // middle separator
                offset++;
            }

            line += hexPart.padEnd(50, ' ') + " |" + asciiPart + "|\n";
            textUpdate += line;
        }

        outBox.textContent += textUpdate;
        terminal.scrollToBottom();

        if (offset < maxOffset) {
            frameId = requestAnimationFrame(renderFrame);
        } else {
            cleanup(`\nEOF. ${maxOffset} bytes processed.`);
        }
    }

    function cleanup(msg) {
        document.removeEventListener('keydown', cancelListener);
        terminal.printLine(msg);
        terminal.input.disabled = false;
        terminal.printHistory('', '');
        terminal.input.focus();
    }

    frameId = requestAnimationFrame(renderFrame);

    return null; // Signals main executor to wait
}
