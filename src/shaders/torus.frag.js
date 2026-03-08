export const torusFragmentShader = `
    varying float vAlpha; varying vec3 vColor;
    void main() {
        vec2 center = gl_PointCoord - 0.5; float dist = length(center);
        if (dist > 0.5) discard;
        float glow = exp(-dist * 8.0); float core = 1.0 - smoothstep(0.0, 0.5, dist);
        // Reduced glow and core brightness significantly so text is visible
        gl_FragColor = vec4(vColor, vAlpha * (core * 0.3 + glow * 0.3));
    }
`;
