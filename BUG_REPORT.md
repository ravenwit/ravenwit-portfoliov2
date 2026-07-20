# Works Section Bug Report

After thorough analysis of the codebase, here are the identified bugs in the Works section:

## CRITICAL BUGS

### Bug 1: `require()` in ES Module — `src/core/scene.js` line 48
```js
const { OrbitControls } = require('three/addons/controls/OrbitControls.js');
```
The project uses `"type": "module"` in `package.json`, making all `.js` files ES modules. `require()` is not available in ES modules. This will throw `ReferenceError: require is not defined` when `initGeofnoRenderer()` is called (i.e., when navigating to the GeoFNO exhibit).

**Impact:** GeoFNO exhibit (index 1) completely fails to initialize. OrbitControls never loads, the 3D scene never renders.

### Bug 2: `exhibitGeofno.js` — `loadDataStreaming` doesn't check `response.ok`
```js
const response = await fetch(url);
if (!response.body) throw new Error("ReadableStream not supported");
```
If the server returns a 404 or 500, the code proceeds to read the body and fails with an unhelpful error. No HTTP status check.

### Bug 3: `exhibitGeofno.js` — `loadDataStreaming` re-fetches data on every exhibit re-entry
The binary files are fetched every time the user navigates to the GeoFNO exhibit, even if already loaded. No caching mechanism.

### Bug 4: `exhibitIsing.js` — Worker message queue grows unbounded
```js
// In render loop (called every rAF frame):
if (worker) worker.postMessage({ type: 'sweep' });
```
The render loop posts a 'sweep' message every animation frame (~60fps) without waiting for the worker to respond. If the worker is slower than 60fps, messages queue up indefinitely, causing the worker to fall behind.

### Bug 5: `exhibitIsing.js` — `createImageData` allocated every frame
```js
const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
```
A new 800×800 ImageData (2.56MB) is allocated every frame. This causes GC pressure at 60fps.

### Bug 6: `exhibitMegh.js` — `roundRect` may not be available
```js
ctx.roundRect(x, y, w, h, 4);
```
`CanvasRenderingContext2D.roundRect()` is a relatively new API (2022). May not be available in older browsers.

### Bug 7: `exhibitMegh.js` — Animation uses fixed timestep
```js
animState.time += 0.016; // ~60fps
```
Uses a hardcoded 16ms timestep instead of actual delta time from `requestAnimationFrame` timestamp. Animation speed varies with actual framerate.

### Bug 8: `exhibitGeofno.js` — `destroyGeofnoExhibit` disposes renderer but doesn't null the exported reference
```js
if (geofnoRenderer) {
    geofnoRenderer.dispose();
}
```
After disposal, `geofnoRenderer` (exported `let` from `scene.js`) still references the disposed renderer. On re-entry, `initGeofnoRenderer` creates a new one, but the old disposed reference lingers.

### Bug 9: `exhibitGeofno.js` — `geofnoScene` children cleared but lights re-added on re-init
```js
while (geofnoScene.children.length > 0) {
    geofnoScene.remove(geofnoScene.children[0]);
}
```
This removes ALL children including stars. On re-init, `initGeofnoRenderer` re-adds lights but `initGeofnoExhibit` re-adds stars. Works but redundant.

### Bug 10: `exhibitGeofno.js` — `updateFrame` doesn't clamp slider max
```js
if (sliderEl) sliderEl.value = frame;
```
The slider was created with `max="496"` but `STATE.geofnoTotalFrames` is 497. Frame 496 is valid (0-indexed, 0-496 = 497 frames). This is actually correct.

### Bug 11: `exhibitGeofno.js` — `errorTexture` created with `RedFormat` but shader reads `.r`
The shader does `texture2D(dataTexture, vUv).r` which is correct for `RedFormat`.

### Bug 12: `exhibitGeofno.js` — `loadSingleStream` uses `contentLength` fallback
```js
const contentLength = parseInt(response.headers.get('Content-Length') || '130285568');
```
Hardcoded fallback value. If the file size changes, this breaks.

## MINOR ISSUES

### Issue 1: `exhibitGeofno.js` — `initGeofnoExhibit` doesn't check if container is visible
The container is set to `display:block` but `container.clientWidth`/`clientHeight` might be 0 if the parent is not visible.

### Issue 2: `exhibitGeofno.js` — No resize handler for GeoFNO renderer
The main resize handler in `scene.js` updates GeoFNO renderer size, but only if the container is visible. This is actually handled correctly.

### Issue 3: `exhibitIsing.js` — No resize handler for Ising canvas
The Ising canvas is fixed at 800×800. No responsive handling.