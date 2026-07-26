import { marked } from 'marked';
import kleinGordonContent from '../../klein-gordon.md?raw';

let isOverlayOpen = false;

/**
 * Protects LaTeX math expressions from markdown parser distortion (such as `_` turning into <em> tags)
 * before passing through `marked`, then restores raw LaTeX ($...$ and $$...$$) for MathJax.
 */
function renderMarkdownWithMath(markdown) {
    const mathBlocks = [];
    
    // 1. Protect code blocks first so math-like symbols in code snippets are not touched
    const codeBlocks = [];
    let text = markdown.replace(/(```[\s\S]*?```|`[^`]+?`)/g, (match) => {
        codeBlocks.push(match);
        return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
    });

    // 2. Protect display math ($$ ... $$)
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        mathBlocks.push({ type: 'display', math: math.trim() });
        return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
    });

    // 3. Protect inline math ($ ... $)
    text = text.replace(/\$([^$\n]+?)\$/g, (match, math) => {
        mathBlocks.push({ type: 'inline', math: math.trim() });
        return `%%MATH_INLINE_${mathBlocks.length - 1}%%`;
    });

    // 4. Restore code blocks
    text = text.replace(/%%CODE_BLOCK_(\d+)%%/g, (_, id) => codeBlocks[id]);

    // 5. Parse Markdown with marked
    let html = marked.parse(text);

    // 6. Restore display & inline math blocks as clean LaTeX for MathJax
    html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_, id) => {
        const item = mathBlocks[id];
        return `<div class="math-display">$$\n${item.math}\n$$</div>`;
    });

    html = html.replace(/%%MATH_INLINE_(\d+)%%/g, (_, id) => {
        const item = mathBlocks[id];
        return `<span class="math-inline">$${item.math}$</span>`;
    });

    return html;
}

export function initReadmeOverlay() {
    const readmeBtn = document.getElementById('research-readme-btn');
    const overlay = document.getElementById('readme-modal-overlay');
    const closeBtn = document.getElementById('readme-close-btn');
    const backdrop = overlay ? overlay.querySelector('.readme-modal-backdrop') : null;

    if (readmeBtn) {
        readmeBtn.addEventListener('click', openReadmeModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeReadmeModal);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeReadmeModal);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOverlayOpen) {
            closeReadmeModal();
        }
    });
}

export function openReadmeModal() {
    const overlay = document.getElementById('readme-modal-overlay');
    const modalBody = document.getElementById('readme-modal-body');
    const progressBar = document.getElementById('readme-progress-bar');
    if (!overlay || !modalBody) return;

    // Render markdown to HTML with protected math
    if (!modalBody.innerHTML.trim()) {
        try {
            const htmlContent = renderMarkdownWithMath(kleinGordonContent);
            modalBody.innerHTML = htmlContent;

            // Generate IDs for headings for smooth section navigation
            const headings = modalBody.querySelectorAll('h1, h2, h3');
            headings.forEach((h, idx) => {
                h.setAttribute('id', `readme-sec-${idx}`);
            });
        } catch (err) {
            console.error("Failed to parse klein-gordon.md markdown:", err);
            modalBody.innerHTML = `<pre style="white-space: pre-wrap;">${kleinGordonContent}</pre>`;
        }
    }

    // Show overlay
    overlay.classList.remove('readme-overlay-hidden');
    isOverlayOpen = true;

    // Track scroll progress
    modalBody.onscroll = () => {
        if (!progressBar) return;
        const totalHeight = modalBody.scrollHeight - modalBody.clientHeight;
        const scrollPct = totalHeight > 0 ? (modalBody.scrollTop / totalHeight) * 100 : 0;
        progressBar.style.width = `${scrollPct}%`;
    };

    // Typeset equations with MathJax if available
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([modalBody]).then(() => {
            console.log("MathJax typesetting completed successfully.");
        }).catch((err) => {
            console.warn("MathJax typeset warning:", err);
        });
    }
}

export function closeReadmeModal() {
    const overlay = document.getElementById('readme-modal-overlay');
    if (!overlay) return;

    overlay.classList.add('readme-overlay-hidden');
    isOverlayOpen = false;
}
