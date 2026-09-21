# Spacetime Portfolio — Mobile Design Specification (Branch: `mobile2`)

## 1. Executive Summary

This specification outlines the architecture, interaction models, and performance engineering required to transform the desktop Spacetime Portfolio into a stunning, tactile mobile experience.

Instead of a generic responsive downgrade or scroll-jacking, mobile devices ($\le 768\text{px}$) run an authentic, high-concept **Relativistic Chrono-Dial** console that turns the smartphone into a tactile scientific instrument.

---

## 2. Understanding Summary & Scope

* **Purpose**: Provide a bespoke mobile experience matching the sci-fi physics wonder of the desktop portfolio with zero scroll-trapping, zero layout distortion, and rock-solid 60fps performance.
* **Audience**: Technical recruiters, physicists, engineers, and creative directors viewing on iOS and Android smartphones.
* **Core Interaction**: The **Relativistic Chrono-Dial**—a knurled physical thumb dial at the bottom operating as a **Dual-Mode Wheel**:
  * **Macro Mode**: Clicks between the 4 primary sectors with $157.1\text{px}$ detents and haptic clicks.
  * **Micro-Scrub Mode**: Fine-tunes the active sector (scrubbing years in Timeline, switching exhibits in Highlights, flipping cards in Archive).
* **4-Sector Architecture**:
  1. **Sector 00 [ORIGIN]**: Liquid Name typography + Fourier epicycles orbital canvas + Social contact chips + Chrono-Dial.
  2. **Sector 01 [TIMELINE]**: Dial scrubs career milestones ($2011 \to 2025$) along the 3D trajectory; Arsenal Matrix is tucked into an expandable glowing pill (`[+] ARSENAL MATRIX`) that slides open into a full-width tabbed drawer (Areas, Categories, Tools).
  3. **Sector 02 [HIGHLIGHTS]**: Dial clicks between Exhibit 01 (Megh), Exhibit 02 (Geo-FNO), and Exhibit 03 (Ising). Full-bleed interactive touch canvas with top telemetry badge and floating live parameter controls.
  4. **Sector 03 [ARCHIVE]**: Microfiche Card Deck where turning the dial flips through research cards one-by-one; swiping up opens full documentation with LaTeX math. Background wave simulation is omitted to maximize performance; the `klein-gordon.md` documentation reader takes center stage.
* **Explicit Non-Goals**:
  * ❌ No Simulation Playground (Sector 04 excluded).
  * ❌ No CLI Terminal (excluded).
  * ❌ No Round Radar on mobile (excluded).
  * ❌ No interactive audio string synthesizer in Origin (excluded).
  * ❌ No desktop-style multi-column layout or 1:1 scroll-jacking.

---

## 3. Assumptions & Non-Functional Requirements

1. **Target Viewports**: Modern mobile portrait screens ($375\text{px} \text{ to } 430\text{px}$ width, e.g., iPhone SE to iPhone 15 Pro Max, Pixel 8).
2. **Performance Target**: Continuous $60\text{fps}$ ($\le 16.67\text{ms}$ frame budget).
3. **Display Density**: Mobile `devicePixelRatio` clamped at $\min(\text{window.devicePixelRatio}, 2.0)$ to reduce GPU fill-rate by $55.6\%$.
4. **Haptics**: `navigator.vibrate(12)` on supported devices with silent graceful fallback on iOS Safari.
5. **Battery Gating**: Background Three.js render loop automatically pauses when full-screen reading drawers (Arsenal or Documentation) are open.

---

## 4. Complete Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| **01** | **Adaptive Hybrid Model (Option 3)** | Direct 1:1 Port (Option 1) | Prevents $3.85\times$ horizontal camera clipping and scroll-trapping while preserving full 3D visual punch. |
| **02** | **Relativistic Chrono-Dial** | Bottom Tab Bar, Continuous Vertical Scroll Feed | Transforms the phone into an authentic, tactile scientific instrument with $12\text{ms}$ haptic detents. |
| **03** | **Dual-Mode Wheel (Macro $\leftrightarrow$ Micro)** | Single-mode Nav, Drawer-only system | Gives one intuitive thumb control for both switching sectors and fine-scrubbing years/exhibits/cards. |
| **04** | **Scope Pruning (4 Sectors)** | 5 Sectors + CLI + Radar | Excluded Playground, CLI Terminal, Radar, and Audio strings to lock performance at 60fps and remove visual clutter. |
| **05** | **Integrated Responsive Architecture (Approach A)** | Multi-Page MPA, Dynamic Async Bundles | Single source of truth for 3D shaders, data, and assets with zero bundle duplication. |
| **06** | **Polar Touch Coordinates for Dial** | Linear horizontal drag slider | Pure polar tracking ($\operatorname{atan2}$) follows the natural circular sweep of the human thumb arc, eliminating thumb strain. |
| **07** | **Center Reset Button (`[⟲ SECTOR]`)** | Double-tap only, long press | A visible physical tactile badge at the center provides an unambiguous, accessible way to exit micro-scrub mode. |
| **08** | **Full-Screen Arsenal Drawer Sheet** | In-place accordion, modal popup | Preserves full $47\text{px} \times 47\text{px}$ cell sizing for all 121 skill icons while keeping the Timeline clean. |
| **09** | **Microfiche Deck for Archive** | Long scrollable list | Matches the physical instrument paradigm, avoiding scroll fatigue while providing dedicated focus for MathJax formulas. |
| **10** | **Sector 02 Renamed to HIGHLIGHTS** | WORKS | Aligns with the desktop dock telemetry label (`HIGHLIGHTS`) for clear, consistent branding. |
| **11** | **Mobile DPR Clamped to 2.0** | Native 3.0+ Retina DPR | Reduces mobile GPU fragment fill-rate by **$55.6\%$**, preventing thermal throttling and guaranteeing sustained 60fps. |
| **12** | **Overscroll Lock & Velocity Clamping** | Native browser bouncing | Prevents iOS Safari rubber-band scrolling during rotary thumb gestures; limits max dial spin speed to prevent skipping sectors. |
| **13** | **Wave Simulation Omitted in Archive, Docs Prioritized** | Background 3D Manifold | Removes GPU drain on mobile; elevates `klein-gordon.md` documentation and MathJax readability to first-class focus. |

---

## 5. Mathematical & Ergonomic Sanity Checks

### 5.1 Vertical Viewport Allocation ($390\text{px} \times 844\text{px}$)
* Safe area top ($47\text{px}$) + bottom ($34\text{px}$) $\implies$ **$763\text{px}$ net usable height**.
* **Chrono-Dial Console**: Bottom **$140\text{px}$** ($y = 704\text{px} \to 844\text{px}$), positioned in the primary ergonomic one-handed thumb zone.
* **Active Stage Window**: **$623\text{px} \times 390\text{px}$** ($73.8\%$ of screen) dedicated to active sector visuals.

### 5.2 Rotary Dial Kinematics
* Total thumb travel arc ($R = 150\text{px}$, $\theta = \pi\text{ rad}$):
  $$s = R \cdot \theta \approx 471.2\text{px}$$
* **Macro Sector Spacing (4 Sectors)**:
  $$\Delta s = \frac{471.2\text{px}}{3} \approx \mathbf{157.1\text{px}}\text{ per sector detent}$$
* **Timeline Micro-Scrub (14 Years, $2011 \to 2025$)**:
  $$\Delta s = \frac{471.2\text{px}}{13} \approx \mathbf{36.2\text{px}}\text{ per milestone detent}$$
* **Magnetic Snap Critical Damping**:
  $$\ddot{\theta} + 2\zeta\omega_n\dot{\theta} + \omega_n^2(\theta - \theta_{\text{detent}}) = 0 \quad (\zeta = 1.0, \omega_n = 30\text{ rad/s})$$
  Settling time: $t_s \approx \frac{4}{\omega_n} \approx \mathbf{133\text{ms}}$ with zero overshoot.

### 5.3 Arsenal Grid Geometry
* Usable drawer width: $390\text{px} - 32\text{px} = 358\text{px}$.
* $7 \times 7$ Matrix Cell Pitch:
  $$\text{Pitch} = \frac{358\text{px}}{7} \approx 51.1\text{px} \implies \text{Cell Size} = 51.1 - 4 = \mathbf{47.1\text{px}} \ge 44\text{px (WCAG target)}$$

### 5.4 GPU Fill-rate Reduction
* iPhone 15 Pro ($390 \times 844$) at $3.0\times$ DPR renders $\approx 2.96\text{M pixels/frame}$.
* At clamped $2.0\times$ DPR, renders $\approx 1.32\text{M pixels/frame}$.
* **Load reduction: $55.6\%$**, guaranteeing zero thermal throttling.

---

## 6. Component Architecture

```
src/
├── mobile/
│   ├── mobileController.js   // Boots mobile, handles sector switching & lifecycle
│   ├── chronoDial.js         // Knurled rotary dial, polar gesture math, haptics
│   ├── mobileDrawer.js       // Arsenal tabbed matrix & Klein-Gordon doc readers
│   ├── mobileHighlights.js   // Direct-touch simulation wrappers (Megh, GeoFNO, Ising)
│   └── microficheDeck.js     // Rolodex card-by-card presentation for Archive
└── styles/
    └── mobile.css            // Cyberdeck touch styling, hardware-accelerated animations
```

---

## 7. Verification & Testing Strategy

1. **Build Validation**: Ensure `npm run build` generates error-free production bundles.
2. **Viewport Range Testing**: Verify on iPhone SE ($375\text{px}$), iPhone 15 ($393\text{px}$), and Pixel 8 ($412\text{px}$).
3. **Dial Kinematics**: Validate polar touch angle conversions, velocity clamping, and magnetic lock feel.
4. **Drawer Accessibility**: Confirm all 121 Arsenal matrix cells have $>44\text{px}$ touch targets.
5. **Documentation Reader**: Verify LaTeX equations render cleanly with horizontal scroll protection.
