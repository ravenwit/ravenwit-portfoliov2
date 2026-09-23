> [!IMPORTANT]
> **Scope Directive**: All tasks apply **strictly to the mobile version**. The desktop version remains 100% untouched.

## 🎯 Active Tasks

- [x] **1. Arsenal Fixed Detail Inspector (Mobile Only)**
  - **Issue**: Selecting a node at the top of the 121-item Arsenal grid requires scrolling to the bottom of the page to read the telemetry/details.
  - **Solution**: Dock the inspector panel to a fixed, elevated bottom sheet / HUD bar with safe-area spacing and a dismiss button, keeping it immediately visible without scrolling.
  - **Scope**: `src/mobile/pages/tabArsenal.js`, `src/styles/mobile.css`.

- [x] **2. Arsenal Filter Tabs Ergonomics & Visuals (Mobile Only)**
  - **Issue**: Filter buttons (`Physics`, `Mathematics`, `AI/ML`, etc.) look harsh, monospace, and uninviting.
  - **Solution**: Redesign into soft, soothing, natural pill-style chips with comfortable hit targets, gentle warm borders, subtle ambient glow, and legible typography.
  - **Scope**: `src/styles/mobile.css`, `src/mobile/pages/tabArsenal.js`.

- [x] **3. Career Timeline: Retain Editor & Prune Stray Pursuits (Mobile Only)**
  - **Status**: Confirmed by user — `editor-magazine` (Pi-Zero to Infinity) is fully valid and retained.
  - **Issue**: Stray "hobby/pursuit" items (Violin, Rubik's cube, Astronomy, Game dev) were appearing directly on the main mobile Career timeline.
  - **Solution**: Filter the mobile timeline in `src/mobile/pages/tabTimeline.js` to show strictly `category === 'career'`, and remove the confusing "PURSUITS" filter chip.
  - **Scope**: `src/mobile/pages/tabTimeline.js`.

- [x] **4. Hobbies/Pursuits Clarification & Isolation (Mobile Only)**
  - **Status**: Personal pursuits and toys are already properly categorized in the mobile Arsenal Matrix (`hobbies.json`).
  - **Solution**: Keep mobile Career timeline decoupled from hobbies so each section has clean, distinct domain boundaries.
  - **Scope**: `src/mobile/pages/tabTimeline.js`.

- [x] **5. Works Section: Megh Correction (Mobile Only)**
  - **Issue**: Megh is erroneously described as "Acoustic Synthesis" and "Neural Speech Simulation".
  - **Solution**: Restore Megh to its authentic identity as the **Cloud Storage Vault** (client-side AES-256 encrypted multi-cloud unified storage aggregator combining GDrive, Dropbox, MEGA, OneDrive, B2).
  - **Scope**: `src/mobile/pages/tabWorks.js`, `src/mobile/mobileHighlights.js`.

- [x] **6. Works Section Links Audit & Fix (Mobile Only)**
  - **Issue**: Links currently fall back to generic GitHub profiles or broken endpoints.
  - **Solution**: Wire exact URLs:
    - Megh: `https://megh-vault.vercel.app` + dedicated repo.
    - Geo-FNO: `https://github.com/ravenwit/NOMAD`.
    - Ising: `https://github.com/ravenwit/Numerical/blob/master/IsingModel.py`.
  - **Scope**: `src/mobile/pages/tabWorks.js`.

- [x] **7. Aesthetic Transformation: Terminal Cyberdeck → Qucontext Editorial Lab (Mobile Only)**
  - **Issue**: The current terminal/CRT style feels dated, harsh, and abrasive (scanlines, neon monospace, cyberdeck brackets).
  - **Solution**: Adopt the **Qucontext** aesthetic across mobile views:
    - **Color Palette**: Deep void midnight (`#06060c`), card panels (`#0b0b14`), warm eggshell ink (`#ece7db`), slate-lavender (`#8f8d9c`), quantum cyan (`#6fdcf7`), scientific gold (`#e8b45c`), soft rose (`#fb5c7a`).
    - **Typography**: Editorial serif headings (`Fraunces` / `Playfair Display`), crisp body (`Inter`), and restrained technical mono (`JetBrains Mono` / `IBM Plex Mono`).
    - **Atmosphere**: Subtle film grain/noise, luminous mathematical hairlines, smooth glass cards with soft borders (`rgba(236, 231, 219, 0.09)`), and soothing natural lighting.
  - **Scope**: `src/styles/mobile.css`, `src/mobile/pages/*.js`, `src/mobile/chronoDial.js`, `src/mobile/mobileDrawer.js`.

