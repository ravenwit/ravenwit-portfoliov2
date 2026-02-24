export const scalarFragmentShader = `
    uniform float uGlobalTemp;
    
    varying float vAlpha;
    varying float vTemperature;

    void main() {
        vec2 center = gl_PointCoord - 0.5; 
        float dist = length(center);
        
        // Circular point
        if (dist > 0.5) discard;
        
        // Sharp core with soft glow
        float core = 1.0 - smoothstep(0.0, 0.2, dist);
        float glow = exp(-dist * 6.0);

        // Base color is a cool cyan/blue
        vec3 coolColor = vec3(0.0, 0.8, 1.0);
        // Heated color goes towards deep violet/red
        vec3 hotColor = vec3(0.8, 0.2, 1.0);
        
        // Mix based on local vertex temperature AND global system temperature
        float heatMix = mix(vTemperature, 1.0, clamp((uGlobalTemp - 50.0) / 50.0, 0.0, 1.0));
        vec3 finalColor = mix(coolColor, hotColor, heatMix);

        // Highly transparent, compounding additive blends
        gl_FragColor = vec4(finalColor, vAlpha * (core * 0.6 + glow * 0.4));
    }
`;
