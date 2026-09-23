// ==========================================================================
// Spacetime Portfolio — Mobile Page: Hero & Bio (Tab 01)
// Typographic identity, background narrative, research pillars & direct links
// ==========================================================================

export function renderTabBio(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-bio-container">
            <!-- Cyberdeck Telemetry Header -->
            <div class="mobile-bio-status-bar">
                <div class="mobile-bio-status">
                    <span class="chrono-pulse-dot"></span>
                    <span class="mobile-bio-status-text">SYSTEM STATUS: ACTIVE // COLOGNE, DE</span>
                </div>
                <div class="mobile-bio-tau">t: 14.0 yr</div>
            </div>

            <!-- Profile Hero Identity -->
            <div class="mobile-bio-card">
                <div class="mobile-bio-id-row">
                    <div class="mobile-bio-avatar">
                        <span class="mobile-bio-monogram">RW</span>
                        <div class="mobile-bio-avatar-glow"></div>
                    </div>
                    <div class="mobile-bio-title-wrap">
                        <span class="mobile-bio-tagline">[SYSTEM DAEMON // OPERATOR]</span>
                        <h1 class="mobile-bio-name">SHAKIR AHMED</h1>
                        <div class="mobile-bio-alias">aka <strong>ravenwit</strong></div>
                        <div class="mobile-bio-role">MSc Physics Candidate · University of Cologne</div>
                    </div>
                </div>

                <!-- Primary Action Buttons -->
                <div class="mobile-bio-actions">
                    <a href="/Shakir_Ahmed_CV.pdf" target="_blank" rel="noopener" class="mobile-action-btn primary" aria-label="Download Shakir Ahmed CV">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>DOWNLOAD CV</span>
                    </a>
                    <a href="mailto:shakir@ravenwit.com" class="mobile-action-btn secondary" aria-label="Email Shakir Ahmed">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>CONTACT</span>
                    </a>
                </div>

                <!-- Social Quanta Connectors -->
                <div class="mobile-social-quanta">
                    <a href="https://github.com/ravenwit" target="_blank" rel="noopener" class="mobile-quantum-chip" aria-label="GitHub Profile">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        <span>GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/shakir-ahmed-raven" target="_blank" rel="noopener" class="mobile-quantum-chip" aria-label="LinkedIn Profile">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        <span>LinkedIn</span>
                    </a>
                    <a href="https://www.researchgate.net/profile/Shakir-Ahmed-5" target="_blank" rel="noopener" class="mobile-quantum-chip" aria-label="ResearchGate Profile">
                        <span style="font-weight: 800; font-size: 11px;">RG</span>
                        <span>ResearchGate</span>
                    </a>
                    <a href="https://twitter.com/shakir7733" target="_blank" rel="noopener" class="mobile-quantum-chip" aria-label="Twitter Profile">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                        <span>Twitter/X</span>
                    </a>
                </div>
            </div>

            <!-- Terminal Bio / Narrative Section -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[01.1]</span>
                    <h2 class="mobile-section-heading">BACKGROUND // NARRATIVE</h2>
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
                    <span class="mobile-section-code">[01.2]</span>
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

            <!-- Quick Exploration Router -->
            <div class="mobile-bio-section">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[01.3]</span>
                    <h2 class="mobile-section-heading">SYSTEM NAVIGATION</h2>
                </div>
                <div class="mobile-quick-nav-grid">
                    <button class="mobile-quick-nav-card" id="bio-to-timeline" aria-label="Navigate to Career Timeline">
                        <div class="quick-nav-icon">⏱️</div>
                        <div class="quick-nav-content">
                            <div class="quick-nav-title">CAREER TIMELINE</div>
                            <div class="quick-nav-desc">Chronological trajectory from 2011 to 2026+</div>
                        </div>
                        <div class="quick-nav-arrow">→</div>
                    </button>
                    <button class="mobile-quick-nav-card" id="bio-to-works" aria-label="Navigate to Works and Highlights">
                        <div class="quick-nav-icon">⚡</div>
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

    // Hook internal navigation buttons
    const btnTimeline = container.querySelector('#bio-to-timeline');
    if (btnTimeline) {
        btnTimeline.addEventListener('click', () => {
            if (onNavigateTab) onNavigateTab('TIMELINE', 1);
        });
    }

    const btnWorks = container.querySelector('#bio-to-works');
    if (btnWorks) {
        btnWorks.addEventListener('click', () => {
            if (onNavigateTab) onNavigateTab('WORKS', 2);
        });
    }
}
