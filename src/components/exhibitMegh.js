// --- Megh Cloud Upload Exhibit ---
// Animation showing: file → encryption particles → cloud upload → success.

let initialized = false;

export function initMeghExhibit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('works-exhibit-container');
    if (!container) return;

    // Create exhibit HTML
    container.innerHTML = `
<style>
/* scoped CSS for Megh Exhibit */
#megh-exhibit {
    --bg-primary: #050510;
    --text-primary: #e8e8f0;
    --text-secondary: #8888aa;
    --accent-blue: #4a9eff;
    --accent-purple: #8b5cf6;
    --accent-cyan: #06d6a0;
    
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text-primary);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 8px; /* Assuming works-exhibit-container might need it */
}

#megh-exhibit .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--accent-blue);
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-align: center;
    margin-top: 2rem;
}

#megh-exhibit .section-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 1rem;
    line-height: 1.1;
    text-align: center;
}

#megh-exhibit .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 3rem auto;
    text-align: center;
}

#megh-exhibit .merger-visual {
    position: relative;
    width: 100%;
    max-width: 900px;
    height: 400px; /* Reduced to fit better inside the viewport */
    margin: 0 auto;
    perspective: 1200px;
}

#megh-exhibit .cloud-provider {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.75rem;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    cursor: default;
    transform-style: preserve-3d;
}

#megh-exhibit .cloud-provider:hover {
    transform: translateZ(30px) scale(1.08);
}

#megh-exhibit .cloud-provider .size {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.3rem;
    font-weight: 800;
}

#megh-exhibit .cloud-provider .name {
    font-size: 0.65rem;
    opacity: 0.7;
}

#megh-exhibit .cp-gdrive {
    background: linear-gradient(135deg, rgba(66, 133, 244, 0.2), rgba(66, 133, 244, 0.05));
    border: 1px solid rgba(66, 133, 244, 0.3);
    top: 20px;
    left: 5%;
    animation: megh-float-1 6s ease-in-out infinite, megh-provider-enter 1s ease-out 0.5s both;
    box-shadow: 0 0 40px rgba(66, 133, 244, 0.1);
    color: #4285f4;
}

#megh-exhibit .cp-dropbox {
    background: linear-gradient(135deg, rgba(0, 97, 255, 0.2), rgba(0, 97, 255, 0.05));
    border: 1px solid rgba(0, 97, 255, 0.3);
    top: 150px;
    left: 0%;
    animation: megh-float-2 7s ease-in-out infinite, megh-provider-enter 1s ease-out 0.7s both;
    box-shadow: 0 0 40px rgba(0, 97, 255, 0.1);
    color: #0061ff;
}

#megh-exhibit .cp-backblaze {
    background: linear-gradient(135deg, rgba(227, 55, 48, 0.2), rgba(227, 55, 48, 0.05));
    border: 1px solid rgba(227, 55, 48, 0.3);
    top: 260px;
    left: 8%;
    animation: megh-float-3 5.5s ease-in-out infinite, megh-provider-enter 1s ease-out 0.9s both;
    box-shadow: 0 0 40px rgba(227, 55, 48, 0.1);
    color: #e33730;
}

#megh-exhibit .cp-mega {
    background: linear-gradient(135deg, rgba(209, 31, 39, 0.2), rgba(209, 31, 39, 0.05));
    border: 1px solid rgba(209, 31, 39, 0.3);
    top: 10px;
    left: 22%;
    animation: megh-float-2 6.5s ease-in-out infinite, megh-provider-enter 1s ease-out 1.1s both;
    box-shadow: 0 0 40px rgba(209, 31, 39, 0.1);
    color: #d11f27;
}

#megh-exhibit .cp-onedrive {
    background: linear-gradient(135deg, rgba(3, 120, 209, 0.2), rgba(3, 120, 209, 0.05));
    border: 1px solid rgba(3, 120, 209, 0.3);
    top: 220px;
    left: 25%;
    animation: megh-float-1 7.5s ease-in-out infinite, megh-provider-enter 1s ease-out 1.3s both;
    box-shadow: 0 0 40px rgba(3, 120, 209, 0.1);
    color: #0378d1;
}

@keyframes megh-float-1 {
    0%, 100% { transform: translateY(0) rotateX(2deg) rotateY(-2deg); }
    50% { transform: translateY(-15px) rotateX(-2deg) rotateY(2deg); }
}

@keyframes megh-float-2 {
    0%, 100% { transform: translateY(0) rotateX(-1deg) rotateY(3deg); }
    50% { transform: translateY(-20px) rotateX(3deg) rotateY(-1deg); }
}

@keyframes megh-float-3 {
    0%, 100% { transform: translateY(0) rotateX(3deg) rotateY(1deg); }
    50% { transform: translateY(-12px) rotateX(-1deg) rotateY(-3deg); }
}

@keyframes megh-provider-enter {
    from { opacity: 0; transform: translateX(-60px) scale(0.6); }
    to { opacity: 1; }
}

/* Central Vault */
#megh-exhibit .vault-center {
    position: absolute;
    right: 5%;
    top: 0%;
    transform: translateY(-50%);
    width: 220px;
    height: 280px;
    border-radius: 32px;
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(74, 158, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: megh-vault-glow 4s ease-in-out infinite, megh-fadeInUp 1s ease-out 1.5s both;
    box-shadow: 0 0 80px rgba(74, 158, 255, 0.1), inset 0 0 60px rgba(74, 158, 255, 0.03);
}

@keyframes megh-vault-glow {
    0%, 100% { box-shadow: 0 0 80px rgba(74, 158, 255, 0.1), inset 0 0 60px rgba(74, 158, 255, 0.03); }
    50% { box-shadow: 0 0 120px rgba(74, 158, 255, 0.2), inset 0 0 80px rgba(139, 92, 246, 0.05); }
}

#megh-exhibit .vault-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 8px 32px rgba(74, 158, 255, 0.3);
}

#megh-exhibit .vault-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
}

#megh-exhibit .vault-storage {
    font-family: 'JetBrains Mono', monospace;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

#megh-exhibit .vault-label {
    font-size: 0.65rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 2px;
}

#megh-exhibit .vault-bar {
    width: 80%;
    height: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
}

#megh-exhibit .vault-bar-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-cyan));
    width: 0%;
    animation: megh-fill-bar 2s ease-out 2s forwards;
}

@keyframes megh-fill-bar {
    to { width: 62%; }
}

/* Connection Lines */
#megh-exhibit .connection-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

#megh-exhibit .connection-lines svg {
    width: 100%;
    height: 100%;
}

#megh-exhibit .conn-line {
    stroke: url(#meghLineGradient);
    stroke-width: 1.5;
    fill: none;
    stroke-dasharray: 8 4;
    animation: megh-dash-flow 2s linear infinite;
    opacity: 0.5;
}

@keyframes megh-dash-flow {
    to { stroke-dashoffset: -24; }
}

@keyframes megh-fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

#megh-exhibit .reveal {
    opacity: 1; 
}

@media (max-width: 768px) {
    #megh-exhibit .merger-visual { height: 700px; }
    #megh-exhibit .cloud-provider {
        position: relative;
        top: auto !important;
        left: auto !important;
        width: 100%;
        max-width: 180px;
        margin: 0.5rem auto;
    }
    #megh-exhibit .vault-center {
        position: relative;
        right: auto;
        top: auto;
        transform: none;
        margin: 1rem auto;
    }
}
</style>

<div id="megh-exhibit">
    <div class="reveal">
        <div class="section-label">The Vision</div>
        <div class="section-title">One Vault. Every Cloud.</div>
        <div class="section-subtitle">Megh merges fragmented free storage across providers into a single encrypted pool — transparently.</div>
    </div>

    <div class="merger-visual reveal">
        <div class="connection-lines">
            <svg viewBox="0 0 900 400" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="meghLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#4a9eff;stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <path class="conn-line" d="M165,80 C350,80 450,70 635,70" />
                <path class="conn-line" d="M120,210 C300,210 450,100 635,100" />
                <path class="conn-line" d="M192,320 C350,320 450,160 635,160" />
                <path class="conn-line" d="M318,70 C450,70 500,50 635,50" />
                <path class="conn-line" d="M345,280 C480,280 500,130 635,130" />
            </svg>
        </div>

        <div class="cloud-provider cp-gdrive">
            <div class="size">15<small>GB</small></div>
            <div class="name">Google Drive</div>
        </div>
        <div class="cloud-provider cp-dropbox">
            <div class="size">2<small>GB</small></div>
            <div class="name">Dropbox</div>
        </div>
        <div class="cloud-provider cp-backblaze">
            <div class="size">10<small>GB</small></div>
            <div class="name">Backblaze B2</div>
        </div>
        <div class="cloud-provider cp-mega">
            <div class="size">20<small>GB</small></div>
            <div class="name">MEGA</div>
        </div>
        <div class="cloud-provider cp-onedrive">
            <div class="size">5<small>GB</small></div>
            <div class="name">OneDrive</div>
        </div>

        <div class="vault-center">
            <div class="vault-icon">🔒</div>
            <div class="vault-title">Megh Vault</div>
            <div class="vault-storage" data-target="52">52</div>
            <div class="vault-label">GB Unified</div>
            <div class="vault-bar">
                <div class="vault-bar-fill"></div>
            </div>
        </div>
    </div>
    
    <a href="https://megh-vault.vercel.app" target="_blank" style="margin-top:0px; display:inline-block; padding:10px 20px; background:linear-gradient(135deg, #4a9eff, #8b5cf6); color:#fff; text-decoration:none; font-family:'JetBrains Mono', monospace; font-weight:bold; font-size:0.9rem; border:none; border-radius:8px; cursor:pointer; box-shadow:0 4px 15px rgba(74, 158, 255, 0.4); z-index:10; position:relative; margin-bottom: 2rem;">
        Visit Megh →
    </a>
</div>
    `;
}
export function destroyMeghExhibit() {
    initialized = false;
    const container = document.getElementById('works-exhibit-container');
    if (container) container.innerHTML = '';
}