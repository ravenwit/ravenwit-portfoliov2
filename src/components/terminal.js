import * as THREE from 'three';
import { playKeystroke, playEnterKey, playCRTBoot } from './terminalUtils/audio.js';
import { cmdPing, cmdNmap } from './terminalUtils/network.js';
import { cmdChat } from './terminalUtils/ai.js';
import { cmdHexdump } from './terminalUtils/visualizers.js';
import { ASCII_LOGO } from './terminalUtils/graphics.js';

// Terminal overlay component
// Implements the hidden diegetic command line interface

export class TerminalController {
    constructor() {
        this.overlay = document.getElementById('terminal-overlay');
        this.input = document.getElementById('terminal-input');
        this.historyContainer = document.getElementById('terminal-history');

        this.isOpen = false;
        this.history = [];
        this.historyIndex = -1;
        this.isSudo = false;

        // Command telemetry hook for htop
        this.telemetryCallback = null;
        this.htopInterval = null;

        // Virtual File System
        this.vfs = {
            "root": {
                "home": {
                    "resume.pdf": "/Shakir_Ahmed_Resume.pdf",
                    "cv.pdf": "/Shakir_Ahmed_CV.pdf"
                },
                "bin": {
                    "ls": this.cmdLs.bind(this),
                    "cd": this.cmdCd.bind(this),
                    "htop": this.cmdHtop.bind(this),
                    "open": this.cmdOpen.bind(this),
                    "help": this.cmdHelp.bind(this),
                    "sudo": this.cmdSudo.bind(this),
                    "clear": this.cmdClear.bind(this),
                    "echo": this.cmdEcho.bind(this),
                    "cat": this.cmdCat.bind(this),
                    "rm": this.cmdRm.bind(this),
                    "vim": this.cmdVim.bind(this),
                    "ping": (args) => cmdPing(args, this),
                    "nmap": (args) => cmdNmap(args, this),
                    "chat": (args) => cmdChat(args, this),
                    "hexdump": (args) => cmdHexdump(args, this),
                    "whoami": this.cmdWhoami.bind(this),
                    "tauism": this.cmdTauism.bind(this)
                }
            }
        };

        this.cwd = ['root', 'home']; // Array representation of path

        this.buildDynamicVFS();
        this.initEventListeners();
    }

    buildDynamicVFS() {
        // Dynamically import file paths from the public/vfs folder using Vite's glob feature
        const vfsFiles = import.meta.glob('/public/vfs/**/*', { query: '?url', import: 'default' });

        for (const filePath of Object.keys(vfsFiles)) {
            // Remove '/public/vfs/' base path
            const relativePath = filePath.replace('/public/vfs/', '');
            const segments = relativePath.split('/');

            let currentDir = this.vfs.root.home;

            // Traverse/create the directory structure
            for (let i = 0; i < segments.length - 1; i++) {
                const seg = segments[i];
                if (!currentDir[seg]) {
                    currentDir[seg] = {}; // Create directory node
                }
                currentDir = currentDir[seg];
            }

            // Assign the physical public URL mapping for the file
            const filename = segments[segments.length - 1];
            currentDir[filename] = `/vfs/${relativePath}`;
        }
    }

    initEventListeners() {
        // Global toggle key [T]
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in another input (which shouldn't happen much in this portfolio)
            if (e.target.tagName === 'INPUT' && e.target !== this.input && e.target.tagName === 'TEXTAREA') {
                return;
            }

            if ((e.key === '`' || e.key === '~') && !this.isOpen && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.toggleTerminal();
            } else if ((e.key === '`' || e.key === '~' || e.key === 'Escape') && this.isOpen) {
                e.preventDefault();
                this.toggleTerminal();
            }
        });

        // Input handling
        if (this.input) {
            this.input.addEventListener('input', () => this.updateInputWidth());

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = this.input.value.trim();
                    if (cmd) {
                        this.executeCommand(cmd);
                    } else {
                        // Empty line, just print prompt
                        this.printHistory('', '');
                    }
                    this.input.value = '';
                    this.historyIndex = this.history.length; // Reset history index
                    this.updateInputWidth();
                    playEnterKey();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                        this.input.value = this.history[this.historyIndex];
                        this.updateInputWidth();
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (this.historyIndex < this.history.length - 1) {
                        this.historyIndex++;
                        this.input.value = this.history[this.historyIndex];
                    } else {
                        this.historyIndex = this.history.length;
                        this.input.value = '';
                    }
                    this.updateInputWidth();
                } else {
                    if (e.key.length === 1 || e.key === 'Backspace') {
                        playKeystroke();
                    }
                }
            });

            // Prevent losing focus when clicking the overlay
            this.overlay.addEventListener('click', () => {
                if (this.isOpen) {
                    this.input.focus();
                }
            });
        }
    }

    updateInputWidth() {
        if (!this.input) return;
        this.input.style.width = Math.max(1, this.input.value.length) + 'ch';
    }

    toggleTerminal() {
        if (this.isAnimating) return;

        this.isOpen = !this.isOpen;
        this.isAnimating = true;

        if (this.isOpen) {
            this.overlay.classList.add('terminal-open');
            this.overlay.classList.remove('terminal-hidden');
            this.overlay.classList.remove('terminal-closing');
            document.body.style.overflow = 'hidden'; // Lock background scrolling

            // Wait for crt-turn-on animation
            setTimeout(() => {
                this.isAnimating = false;
                this.input.focus();
                // Play boot sequence if first time opening and empty history
                if (this.historyContainer.innerHTML === '') {
                    playCRTBoot();
                    this.playBootSequence();
                }
            }, 400);
        } else {
            this.overlay.classList.remove('terminal-open');
            this.overlay.classList.add('terminal-closing');
            document.body.style.overflow = ''; // Restore background scrolling
            this.input.blur();

            // Stop htop if running
            if (this.htopInterval) {
                clearInterval(this.htopInterval);
                this.htopInterval = null;
                this.printLine('^C');
            }

            // Wait for crt-turn-off animation before hiding
            setTimeout(() => {
                this.isAnimating = false;
                if (!this.isOpen) {
                    this.overlay.classList.remove('terminal-closing');
                    this.overlay.classList.add('terminal-hidden');
                }
            }, 400);
        }
    }

    getPromptString() {
        const user = this.isSudo ? 'root' : 'user';
        const symbol = this.isSudo ? '#' : '$';

        // Format path display
        let pathStr = '';
        if (this.cwd.length >= 2 && this.cwd[0] === 'root' && this.cwd[1] === 'home') {
            pathStr = '~';
            if (this.cwd.length > 2) {
                pathStr += '/' + this.cwd.slice(2).join('/');
            }
        } else if (this.cwd.length === 1 && this.cwd[0] === 'root') {
            pathStr = '/';
        } else {
            pathStr = '/' + this.cwd.slice(1).join('/');
        }

        return `[${user}@raven ${pathStr}]${symbol} `;
    }

    updatePrompt() {
        const promptEl = document.getElementById('terminal-prompt');
        if (promptEl) {
            promptEl.textContent = this.getPromptString();
        }
    }

    printHistory(cmd, output, isError = false) {
        if (!this.historyContainer) return;

        const entry = document.createElement('div');
        entry.className = 'terminal-history-entry';

        const promptStr = this.getPromptString();

        let html = '';
        if (cmd !== null && cmd !== undefined) {
            html += `<div class="terminal-history-cmd-row"><span class="terminal-prompt">${promptStr}</span><span class="terminal-history-cmd">${this.escapeHTML(cmd)}</span></div>`;
        }

        if (output) {
            const outClass = isError ? 'terminal-history-output terminal-error' : 'terminal-history-output';
            html += `<div class="${outClass}">${output}</div>`;
        }

        entry.innerHTML = html;
        this.historyContainer.appendChild(entry);

        // Scroll to bottom safely
        this.scrollToBottom();
    }

    printLine(output, isError = false) {
        this.printHistory(null, output, isError);
    }

    scrollToBottom() {
        if (this.historyContainer && this.historyContainer.parentElement) {
            this.historyContainer.parentElement.scrollTop = this.historyContainer.parentElement.scrollHeight;
        }
    }

    escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    executeCommand(cmdStr) {
        // Don't execute if htop is running
        if (this.htopInterval) {
            if (cmdStr.trim().toLowerCase() === 'q' || cmdStr.trim().toLowerCase() === 'exit') {
                clearInterval(this.htopInterval);
                this.htopInterval = null;
                this.printLine('Quit htop.');
            } else {
                this.printLine('htop is running. Type "q" to exit.');
            }
            return;
        }

        // Add to history array for up/down arrow cycling
        if (this.history[this.history.length - 1] !== cmdStr) {
            this.history.push(cmdStr);
        }

        // Tokenize command by spaces, respecting quotes (simple split for now as per spec)
        const tokens = cmdStr.match(/(?:[^\s"]+|"[^"]*")+/g).map(t => t.replace(/(^"|"$)/g, ''));
        if (!tokens || tokens.length === 0) return;

        const command = tokens[0].toLowerCase();
        const args = tokens.slice(1);

        // Check if command exists in /bin
        if (this.vfs.root.bin[command] && typeof this.vfs.root.bin[command] === 'function') {
            const output = this.vfs.root.bin[command](args);
            if (output !== undefined && output !== null) {
                this.printHistory(cmdStr, output);
            } else if (output === undefined) {
                // Command handled its own printing or had no output
                this.printHistory(cmdStr, '');
            }
            // If output is null, it means the command explicitly signals an async bypass. We do not print a prompt automatically here.
        } else {
            this.printHistory(cmdStr, `bash: ${command}: command not found`, true);
        }
    }

    // --- VFS Helpers ---

    getNodeAtPath(pathArray) {
        let current = this.vfs;
        for (let i = 0; i < pathArray.length; i++) {
            if (current[pathArray[i]] === undefined) {
                return undefined;
            }
            current = current[pathArray[i]];
        }
        return current;
    }

    resolvePath(pathStr) {
        if (!pathStr || pathStr === '.') return [...this.cwd];
        if (pathStr === '~') return ['root', 'home'];

        let segments;
        let resultPath;

        if (pathStr.startsWith('/')) {
            segments = pathStr.split('/').filter(Boolean);
            resultPath = ['root', ...segments];
        } else {
            segments = pathStr.split('/').filter(Boolean);
            resultPath = [...this.cwd];

            for (const seg of segments) {
                if (seg === '..') {
                    if (resultPath.length > 1) resultPath.pop();
                } else if (seg !== '.') {
                    resultPath.push(seg);
                }
            }
        }

        // Verification - does this path actually exist in VFS?
        const node = this.getNodeAtPath(resultPath);
        if (node === undefined) {
            return null; // Invalid path
        }

        return resultPath;
    }

    // --- Commands ---

    cmdHelp() {
        return `Available commands:
  cd [dir]    Change directory
  ls [opts] [dir] List directory contents (-a, -l, -al)
  open [file] Open a file in a new tab
  htop        View real-time WebGL performance metrics
  ping        Network diagnostic
  nmap        Network security scanner
  chat        Initialize local LLM chat interface
  hexdump     Read memory ranges
  whoami      Display system insignia
  tauism      3D manifold explorer based on Frenet–Serret frames
  clear       Clear terminal output
  sudo        Elevate privileges
  help        Show this message`;
    }

    cmdWhoami() {
        // Enclose in <pre> to preserve all whitespace and line breaks perfectly in HTML
        return `<pre class="ascii-logo">${ASCII_LOGO}</pre>`;
    }

    cmdTauism() {
        window.open('https://tauism-941215853460.us-west1.run.app/', '_blank');
        return 'Opening Tauism - 3D Manifold Explorer...';
    }

    cmdLs(args) {
        let showHidden = false;
        let showDetails = false;
        let targetPathStr = '.';

        // Parse arguments
        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.includes('a')) showHidden = true;
                if (arg.includes('l')) showDetails = true;
            } else {
                targetPathStr = arg;
            }
        }

        const targetPath = this.resolvePath(targetPathStr);

        if (!targetPath) {
            return `ls: cannot access '${targetPathStr}': No such file or directory`;
        }

        const node = this.getNodeAtPath(targetPath);

        if (typeof node === 'object') {
            // It's a directory
            let entries = Object.keys(node);

            // Mock hidden files
            if (showHidden && targetPathStr === '.') {
                entries = ['.', '..', '.DS_Store', '.bashrc', ...entries];
            } else if (!showHidden) {
                entries = entries.filter(e => !e.startsWith('.'));
            }

            if (!showDetails) {
                return entries.map(key => {
                    const child = node[key] || (key === '.' || key === '..' ? {} : null);
                    if (typeof child === 'object' && child !== null) {
                        return `<span style="color: #61afef; font-weight: bold;">${key}${key !== '.' && key !== '..' ? '/' : ''}</span>`;
                    } else if (typeof child === 'function') {
                        return `<span style="color: #98c379;">${key}*</span>`;
                    } else {
                        return key;
                    }
                }).join('  ');
            } else {
                // Detailed view (-l or -al)
                const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
                return entries.map(key => {
                    const child = node[key] || (key === '.' || key === '..' ? {} : null);
                    let perms = '-rw-r--r--';
                    let size = '4096';
                    let linkCount = 1;

                    let nameDisplay = key;

                    if (typeof child === 'object' && child !== null) {
                        perms = 'drwxr-xr-x';
                        linkCount = 2;
                        nameDisplay = `<span style="color: #61afef; font-weight: bold;">${key}${key !== '.' && key !== '..' ? '/' : ''}</span>`;
                    } else if (typeof child === 'function') {
                        perms = '-rwxr-xr-x';
                        size = '12K';
                        nameDisplay = `<span style="color: #98c379;">${key}*</span>`;
                    } else {
                        size = Math.floor(Math.random() * 500 + 120) + 'K';
                    }

                    return `${perms}  ${linkCount} user  staff  ${size.padStart(5, ' ')} ${dateStr} ${nameDisplay}`;
                }).join('\n');
            }
        } else {
            // It's a file
            if (showDetails) {
                const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
                return `-rw-r--r--  1 user  staff   1.2M ${dateStr} ${targetPath[targetPath.length - 1]}`;
            }
            return targetPath[targetPath.length - 1];
        }
    }

    cmdCd(args) {
        if (args.length === 0) {
            this.cwd = ['root', 'home'];
            this.updatePrompt();
            return '';
        }

        const targetPathStr = args[0];
        const targetPath = this.resolvePath(targetPathStr);

        if (!targetPath) {
            return `cd: ${targetPathStr}: No such file or directory`;
        }

        const node = this.getNodeAtPath(targetPath);
        if (typeof node !== 'object' || node === null) {
            return `cd: ${targetPathStr}: Not a directory`;
        }

        this.cwd = targetPath;
        this.updatePrompt();
        return '';
    }

    cmdOpen(args) {
        if (args.length === 0) {
            return 'open: missing operand';
        }

        const targetPathStr = args[0];
        const targetPath = this.resolvePath(targetPathStr);

        if (!targetPath) {
            return `open: ${targetPathStr}: No such file or directory`;
        }

        const node = this.getNodeAtPath(targetPath);
        if (typeof node === 'object' && node !== null) {
            return `open: ${targetPathStr}: Is a directory`;
        } else if (typeof node === 'string') {
            // Assume it's a URL/path to a file in public/
            window.open(node, '_blank');
            return `Opening ${targetPathStr}...`;
        } else {
            return `open: ${targetPathStr}: Cannot open this file type`;
        }
    }

    cmdClear() {
        if (this.historyContainer) {
            this.historyContainer.innerHTML = '';
        }
        return null; // Return null so no empty entry is drawn
    }

    cmdEcho(args) {
        return args.join(' ');
    }

    cmdSudo(args) {
        if (args.length > 0) {
            return `sudo: execute command not fully supported. Just typing 'sudo' elevates shell.`;
        }

        if (this.isSudo) {
            return `You already have root privileges.`;
        }

        // Very basic mock sudo
        this.isSudo = true;
        this.updatePrompt();
        return `[sudo] password for user: \nAccess granted. Welcome to root.`;
    }

    cmdHtop() {
        if (!this.telemetryCallback) {
            return 'Error: Telemetry hook not initialized. WebGL context cannot be reached.';
        }

        this.printHistory('htop', 'Starting WebGL telemetry... (Press "q" or "exit" to quit)');

        // Create a dedicated dynamic container for htop output
        const htopContainer = document.createElement('div');
        htopContainer.className = 'terminal-history-output';
        htopContainer.style.color = '#e5c07b';
        htopContainer.id = 'htop-active-container';
        this.historyContainer.appendChild(htopContainer);

        this.htopInterval = setInterval(() => {
            const stats = this.telemetryCallback();

            let bar1 = this.generateBar(stats.fps / 144, 20); // Assume 144 max for bar
            let bar2 = this.generateBar(Math.min(stats.calls / 100, 1), 20);
            let bar3 = this.generateBar(Math.min(stats.geometries / 500, 1), 20);

            htopContainer.innerHTML = `
Mem[|||||||||||||      134M/1.2G]   Tasks: 42, 1 thr; 1 running
Swp[                       0K/0K]   Load average: 0.05 0.12 0.08

  FPS   [${bar1}] ${stats.fps.toFixed(1)}
  Calls [${bar2}] ${stats.calls}
  Geoms [${bar3}] ${stats.geometries}
  Tris  [|||||||||||||      ${stats.triangles}]

PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 1  root       20   0  1.2G  134M   12M S  4.0 11.2  0:12.33 [three.js-render]
 2  user       20   0  0.1G   10M    2M R  0.1  0.8  0:00.41 [terminal-ui]
             `;
            this.scrollToBottom();
        }, 500);

        return null;
    }

    generateBar(percent, length) {
        const pilength = Math.floor(Math.max(0, Math.min(1, percent)) * length);
        return '|'.repeat(pilength) + ' '.repeat(length - pilength);
    }

    // --- Easter Eggs ---

    cmdRm(args) {
        if (args.join(' ') === '-rf /') {
            // Shake effect
            document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
            setTimeout(() => { document.body.style.animation = ''; }, 500);
            return '<span class="terminal-error">Permission Denied: You are not root (even if you think you are). System protection engaged.</span>';
        }
        return 'rm: missing operand';
    }

    cmdVim() {
        return 'Nice try, but this is a readonly VFS. Exiting (which you probably don\'t know how to do normally).';
    }

    cmdCat(args) {
        if (args.length === 0) {
            const msgs = ['meow', 'dog', 'purr'];
            return msgs[Math.floor(Math.random() * msgs.length)];
        }
        const file = args[0];
        if (file === 'resume.pdf' || file === 'cv.pdf') {
            return 'Trust me, you do not want to get overwhelmed with binary data.';
        }
        const target = this.resolvePath(file);
        if (target && typeof this.getNodeAtPath(target) === 'object') {
            return `cat: ${file}: Is a directory`;
        }
        return `cat: ${file}: No such file or directory`;
    }

    // --- Boot Sequence ---

    playBootSequence() {
        this.input.disabled = true;
        const lines = [
            `<pre class="ascii-logo">${ASCII_LOGO}</pre>`,
            "[ 0.000000] portfolio version 2.017-ravenwit-kernel (infinite iteration)",
            "[ 0.002481] Quantum entanglement checked: OK",
            "[ 0.004123] Quantum decoherence checked: OK",
            "[ 0.005541] Mounting VFS... done.",
            "[ 0.006262] Stacking bin... done.",
            "[ 0.007459] Lexical tokenizer... ready."
        ];

        let i = 0;
        const printNext = () => {
            if (i < lines.length) {
                this.printLine(lines[i]);
                i++;
                setTimeout(printNext, Math.random() * 100 + 50);
            } else {
                this.input.disabled = false;
                this.input.focus();
            }
        };
        printNext();
    }
}

// Global instance 
export const terminal = new TerminalController();
