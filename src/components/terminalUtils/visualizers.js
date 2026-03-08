// src/components/terminalUtils/visualizers.js
// Handles complex data output and hex streams.

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
