// ==========================================================================
// Spacetime Portfolio — Mobile Page: Hero & Bio (Tab 01)
// Clean typographic identity, background narrative, research pillars & interactive dock
// ==========================================================================

import { triggerHaptic } from '../chronoDial.js';

export function renderTabBio(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-bio-container">
            <!-- Profile Hero Identity with Official SVG Logo -->
            <div class="mobile-bio-card">
                <div class="mobile-bio-id-row">
                    <div class="mobile-bio-avatar">
                        <img src="/icons/logo.svg" alt="Ravenwit Logo" class="mobile-bio-logo-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
                        <span class="mobile-bio-monogram" style="display: none;">RW</span>
                        <div class="mobile-bio-avatar-glow"></div>
                    </div>
                    <div class="mobile-bio-title-wrap">
                        <span class="mobile-bio-discipline">THEORETICAL & COMPUTATIONAL PHYSICS</span>
                        <h1 class="mobile-bio-name">SHAKIR AHMED</h1>
                        <div class="mobile-bio-alias">aka <strong>ravenwit</strong></div>
                        <div class="mobile-bio-role">MSc Physics Candidate · University of Cologne</div>
                    </div>
                </div>

                <!-- Interactive Primary Action Deck (Tactile CV & Contact) -->
                <div class="mobile-interactive-actions">
                    <a href="/Shakir_Ahmed_CV.pdf" target="_blank" rel="noopener" class="mobile-bio-btn cv-btn" id="bio-cv-btn" aria-label="Download Shakir Ahmed Curriculum Vitae">
                        <span class="bio-btn-glow"></span>
                        <div class="bio-btn-icon-wrap cv-icon-glow">
                            <svg class="bio-btn-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <polyline points="9 15 12 18 15 15"></polyline>
                            </svg>
                        </div>
                        <span class="bio-btn-text" id="bio-cv-text">CV / RESUME</span>
                        <span class="bio-btn-badge">PDF</span>
                    </a>

                    <button type="button" class="mobile-bio-btn touch-btn" id="bio-email-btn" aria-label="Get In Touch with Shakir Ahmed">
                        <span class="bio-btn-glow"></span>
                        <div class="bio-btn-icon-wrap touch-icon-glow">
                            <svg class="bio-btn-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <span class="bio-btn-text" id="bio-email-text">GET IN TOUCH</span>
                        <span class="bio-btn-badge">✦</span>
                    </button>
                </div>

                <!-- Interactive Tactile Social Dock -->
                <div class="mobile-social-dock-wrapper">
                    <div class="mobile-social-dock" id="bio-social-dock">
                        <!-- GitHub -->
                        <a href="https://github.com/ravenwit" target="_blank" rel="noopener" class="mobile-social-icon-btn github" data-platform="github" aria-label="GitHub Profile">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            <span class="social-hover-ring"></span>
                        </a>

                        <!-- LinkedIn -->
                        <a href="https://www.linkedin.com/in/shakir-ahmed-raven" target="_blank" rel="noopener" class="mobile-social-icon-btn linkedin" data-platform="linkedin" aria-label="LinkedIn Profile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <span class="social-hover-ring"></span>
                        </a>

                        <!-- ResearchGate -->
                        <a href="https://www.researchgate.net/profile/Shakir-Ahmed-5" target="_blank" rel="noopener" class="mobile-social-icon-btn researchgate" data-platform="researchgate" aria-label="ResearchGate Profile">
                            <span class="rg-vector-glyph">RG</span>
                            <span class="social-hover-ring"></span>
                        </a>

                        <!-- X / Twitter -->
                        <a href="https://twitter.com/shakir7733" target="_blank" rel="noopener" class="mobile-social-icon-btn x-corp" data-platform="x" aria-label="X (Twitter) Profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span class="social-hover-ring"></span>
                        </a>
                    </div>

                    <!-- Dynamic Interactive Identity Tooltip Strip -->
                    <div class="mobile-social-tooltip" id="social-active-tooltip" style="display: none;">
                        <span class="tooltip-dot"></span>
                        <span class="tooltip-text" id="tooltip-text"></span>
                    </div>
                </div>
            </div>

            <!-- Narrative Background Section -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <h2 class="mobile-section-heading">ABOUT ME</h2>
                </div>
                <div class="mobile-text-card">
                    <p class="mobile-bio-lead">
                        Passionate physics student and computational systems architect driven by a boundless sense of wonder about the universe, from category theory and holographic duality to quantum many-body physics.
                    </p>
                    <p>
                        I have been writing code since age 13, when I discovered computers could build autonomous systems rather than just running static software. That curiosity began with custom tools in Visual Basic 6.0 and extended across Linux server administration, network routing, and security, eventually converging with my passion for physics and higher mathematics.
                    </p>
                    <p>
                        Currently establishing research expertise in <strong>quantum error correction</strong>, <strong>tensor networks</strong>, and <strong>neural operator architectures</strong> to bridge rigorous theoretical formulations with high-performance computational models.
                    </p>
                </div>
            </div>

            <!-- Current Research Vectors -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <h2 class="mobile-section-heading">ACTIVE RESEARCH PILLARS</h2>
                </div>
                <div class="mobile-pillars-grid">
                    <div class="mobile-pillar-card">
                        <div class="mobile-pillar-tag">QUANTUM INFO</div>
                        <div class="mobile-pillar-title">Quantum Error Correction & Many-Body Systems</div>
                        <div class="mobile-pillar-desc">Simulating topological phase transitions, surface codes, and tensor networks for fault-tolerant quantum computation.</div>
                    </div>
                    <div class="mobile-pillar-card">
                        <div class="mobile-pillar-tag">AI & PHYSICS</div>
                        <div class="mobile-pillar-title">Geometric Deep Learning & Fourier Operators</div>
                        <div class="mobile-pillar-desc">Solving non-linear partial differential equations on manifold geometries via Geo-FNO neural operators.</div>
                    </div>
                    <div class="mobile-pillar-card">
                        <div class="mobile-pillar-tag">STATISTICAL MECHANICS</div>
                        <div class="mobile-pillar-title">Inverse Hamiltonian Parameter Inference</div>
                        <div class="mobile-pillar-desc">Reconstructing generative coupling constants and external fields from observed microstates via thermodynamic log-likelihood.</div>
                    </div>
                </div>
            </div>

            <!-- Direct Navigation Router -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <h2 class="mobile-section-heading">DIRECT EXPLORATION</h2>
                </div>
                <div class="mobile-quick-nav-grid">
                    <button class="mobile-quick-nav-card" id="bio-to-timeline" aria-label="Navigate to Career Timeline">
                        <div class="quick-nav-icon-wrap">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div class="quick-nav-content">
                            <div class="quick-nav-title">CAREER TIMELINE</div>
                            <div class="quick-nav-desc">Chronological trajectory from 2011 to 2026+</div>
                        </div>
                        <div class="quick-nav-arrow">→</div>
                    </button>
                    <button class="mobile-quick-nav-card" id="bio-to-works" aria-label="Navigate to Works and Highlights">
                        <div class="quick-nav-icon-wrap">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <div class="quick-nav-content">
                            <div class="quick-nav-title">WORKS & EXHIBITS</div>
                            <div class="quick-nav-desc">Megh, Geo-FNO, Ising & Research Archive</div>
                        </div>
                        <div class="quick-nav-arrow">→</div>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Hook Interactive Social Dock Micro-Interactions
    setupInteractiveSocialDock(container);

    // Hook CV & Email buttons with tactile micro-interactions
    setupActionButtons(container);

    // Hook internal navigation buttons
    const btnTimeline = container.querySelector('#bio-to-timeline');
    if (btnTimeline) {
        btnTimeline.addEventListener('click', () => {
            triggerHaptic(12);
            if (onNavigateTab) onNavigateTab('TIMELINE', 1);
        });
    }

    const btnWorks = container.querySelector('#bio-to-works');
    if (btnWorks) {
        btnWorks.addEventListener('click', () => {
            triggerHaptic(12);
            if (onNavigateTab) onNavigateTab('WORKS', 2);
        });
    }
}

function setupInteractiveSocialDock(container) {
    const dock = container.querySelector('#bio-social-dock');
    const tooltip = container.querySelector('#social-active-tooltip');
    const tooltipText = container.querySelector('#tooltip-text');
    const tooltipDot = container.querySelector('.tooltip-dot');
    if (!dock || !tooltipText) return;

    const channelMeta = {
        github: {
            title: 'GitHub',
            handle: '@ravenwit',
            desc: '50+ public repos, QEC simulations & neural operators',
            color: '#a78bfa'
        },
        linkedin: {
            title: 'LinkedIn',
            handle: 'shakir-ahmed-raven',
            desc: 'MSc Physics Candidate at University of Cologne',
            color: '#38bdf8'
        },
        researchgate: {
            title: 'ResearchGate',
            handle: 'Shakir-Ahmed-5',
            desc: 'Scientific preprints, theoretical derivations & citations',
            color: '#2dd4bf'
        },
        x: {
            title: 'X / Twitter',
            handle: '@shakir7733',
            desc: 'Physics insights, geometric deep learning & complexity',
            color: '#f8fafc'
        }
    };

    const iconBtns = dock.querySelectorAll('.mobile-social-icon-btn');
    iconBtns.forEach(btn => {
        const platform = btn.getAttribute('data-platform');
        const meta = channelMeta[platform];
        if (!meta) return;

        const activate = () => {
            triggerHaptic(10);
            iconBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tooltip) {
                tooltip.style.display = 'flex';
                tooltip.classList.add('active');
            }
            if (tooltipDot) {
                tooltipDot.style.background = meta.color;
                tooltipDot.style.boxShadow = `0 0 8px ${meta.color}`;
            }
            tooltipText.innerHTML = `<strong>${meta.title}</strong> (${meta.handle}) · ${meta.desc}`;
        };

        btn.addEventListener('pointerenter', activate);
        btn.addEventListener('touchstart', activate, { passive: true });
        btn.addEventListener('click', () => {
            triggerHaptic(15);
        });
    });
}

function setupActionButtons(container) {
    const cvBtn = container.querySelector('#bio-cv-btn');
    const mailBtn = container.querySelector('#bio-email-btn');
    const mailText = container.querySelector('#bio-email-text');

    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            triggerHaptic(20);
            cvBtn.classList.add('pulse-active');
            setTimeout(() => cvBtn.classList.remove('pulse-active'), 1200);
        });
    }

    if (mailBtn && mailText) {
        mailBtn.addEventListener('click', () => {
            triggerHaptic(18);
            mailBtn.classList.add('copied');
            const orig = mailText.textContent;
            mailText.textContent = '✓ COPIED!';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('shakir@ravenwit.com').catch(() => {});
            }

            setTimeout(() => {
                mailText.textContent = orig;
                mailBtn.classList.remove('copied');
            }, 2200);

            // Also smoothly initiate mailto
            setTimeout(() => {
                window.location.href = 'mailto:shakir@ravenwit.com';
            }, 350);
        });
    }
}
