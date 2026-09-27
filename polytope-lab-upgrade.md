# Polytope Lab Upgrade Plan

## Goal
Upgrade the Polytope Lab (`qucontext`) with interactive 3D point inspection for all 8 cube corners, navigation of odd-parity forbidden inequalities with supporting planes, and mouse-drag 3D interaction for the test point.

## Tasks
- [x] Task 1: Extend `src/lib/polytope.ts` with complete 8-corner geometry (4 classical even-parity vertices + 4 non-classical odd-parity corners) and dual/odd-parity inequality definitions with parity analysis → Verify: Unit functions return correct 8 vertices, distances, and 4 odd inequalities with proper slack formulas.
- [x] Task 2: Implement 3D mouse drag interaction for the probe point with OrbitControls suspension and camera-plane projection → Verify: Dragging the point in the canvas moves `activePt` smoothly and updates coordinates and weights.
- [x] Task 3: Add interactive canvas picking/click inspector for all 8 corners ($v_1..v_4$ and $c_1..c_4$) with 3D badges and coordinate overlays → Verify: Clicking any corner in 3D selects it, highlights it, displays coordinates & physics, and allows setting probe point.
- [x] Task 4: Add navigation for odd-parity inequalities ($O_1..O_4$) alongside classical facets ($F_1..F_4$) with supporting plane visualization and violation breakdown → Verify: Switching to odd inequalities displays the plane in 3D, highlights classical vertex violations, and explains the topological obstruction.
- [x] Task 5: Enhance UI controls with drag plane selector, parity toggle, and synchronized coordinate/weight displays → Verify: Sliders, drag controls, and preset buttons stay perfectly synchronized.
- [x] Task 6: Build and typecheck the qucontext lab → Verify: `npm run build` inside `Resources/quantum learning journey` succeeds without TypeScript or Vite errors.

## Done When
- [x] Canvas displays and inspects all 8 cube vertices ($v_1..v_4$ and $c_1..c_4$) with click-to-inspect and coordinate tooltips.
- [x] Odd-parity inequalities ($O_1..O_4$) are navigable with 3D planes and mathematical violation analysis.
- [x] Test point can be directly dragged with mouse in the 3D canvas with real-time mathematical updates.
- [x] Build succeeds cleanly with zero errors.
