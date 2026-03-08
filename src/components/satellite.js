export function initSatelliteLabel(containerId, buttonId, baseRadius = 350, orbitSpeed = 0.001, initialAngle = 0) {
    const container = document.getElementById(containerId);
    const button = document.getElementById(buttonId);
    if (!container || !button) return;

    let time = initialAngle;
    let isHovered = false;
    let currentRadius = baseRadius;

    // Center coordinates relative to the screen, we'll anchor it purely via transform
    // so we don't strictly need to track top/left offset in JS for the base orbit.
    // The CSS will handle the base absolute centering (top:50%, left:50%).

    // Parallax variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const PARALLAX_STRENGTH = 20;

    // Track mouse for parallax exactly like main.js logic for fourier container
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetX = x * PARALLAX_STRENGTH;
        targetY = -y * PARALLAX_STRENGTH;
    });

    // Hover interactions
    button.addEventListener('mouseenter', () => {
        isHovered = true;
    });

    button.addEventListener('mouseleave', () => {
        isHovered = false;
    });

    function getDynamicRadius() {
        // Scale proportionally to viewport based on a 1080p standard (min dimension ~900 to 1080)
        const minDim = Math.min(window.innerWidth, window.innerHeight);
        const scale = minDim / 900;
        // Clamp scale to not be too small on very small screens, though mobile has its own redirect
        return baseRadius * Math.max(0.5, Math.min(scale, 1.2));
    }

    function animate() {
        requestAnimationFrame(animate);

        // Smoothly interpolate parallax
        mouseX += (targetX - mouseX) * 0.1;
        mouseY += (targetY - mouseY) * 0.1;

        const dynamicTargetRadius = getDynamicRadius();

        // If hovered, pause time accumulator and slightly bump radius
        if (isHovered) {
            currentRadius += (dynamicTargetRadius * 1.05 - currentRadius) * 0.1;
        } else {
            time += orbitSpeed;
            // Smoothly return radius
            currentRadius += (dynamicTargetRadius - currentRadius) * 0.1;
        }

        // Calculate orbit positions
        const orbitX = Math.cos(time) * currentRadius;
        const orbitY = Math.sin(time) * currentRadius;

        // Apply combined transform to container.
        // The container starts at left:50%, top:50% via CSS.
        // We use translate to offset it by the orbit + parallax.
        container.style.transform = `translate(calc(-50% + ${orbitX + mouseX}px), calc(-50% + ${orbitY + mouseY}px))`;
    }

    animate();
}
