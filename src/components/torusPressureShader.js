// --- Torus Pressure Field Shaders ---
// Port of the R3F TorusVisualizer shader to vanilla Three.js.
// Two shader modes: 'default' (rose gold / bioluminescent mint) and 'error' (heatmap).

export const torusPressureVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

export const torusPressureFragmentShader = `
    uniform float intensity;
    uniform float gain;
    uniform sampler2D dataTexture;
    uniform float isErrorMode;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Default palette: rose gold (positive) / bioluminescent mint (negative)
    vec3 colorZero = vec3(0.04, 0.05, 0.08);
    vec3 colorPos  = vec3(1.0, 0.45, 0.35);
    vec3 colorNeg  = vec3(0.1, 0.95, 0.7);

    // Heatmap palette for error mode
    vec3 heatmap(float t) {
        vec3 c0 = vec3(0.05, 0.05, 0.15);
        vec3 c1 = vec3(0.8, 0.1, 0.2);
        vec3 c2 = vec3(1.0, 0.8, 0.1);
        vec3 c3 = vec3(1.0, 1.0, 1.0);
        
        if (t < 0.33) return mix(c0, c1, t * 3.0);
        if (t < 0.66) return mix(c1, c2, (t - 0.33) * 3.0);
        return mix(c2, c3, (t - 0.66) * 3.0);
    }

    void main() {
        float wave = texture2D(dataTexture, vUv).r;
        
        vec3 materialColor;
        
        if (isErrorMode > 0.5) {
            // Error heatmap mode
            float t = clamp(abs(wave) * gain, 0.0, 1.0);
            materialColor = heatmap(t);
        } else {
            // Default rose gold / mint mode
            if (wave > 0.0) {
                float t = clamp(wave * gain, 0.0, 1.0);
                materialColor = mix(colorZero, colorPos, smoothstep(0.0, 1.0, t));
            } else {
                float t = clamp(-wave * gain, 0.0, 1.0);
                materialColor = mix(colorZero, colorNeg, smoothstep(0.0, 1.0, t));
            }
        }
        
        // Procedural Lighting
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        vec3 lightDir = normalize(vec3(1.0, 1.5, 1.0));
        vec3 lightColor = vec3(1.0, 0.98, 0.95);
        vec3 ambient = vec3(0.2, 0.25, 0.3);
        
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * lightColor;
        
        vec3 halfVector = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfVector), 0.0), 64.0);
        vec3 specular = 0.6 * spec * lightColor;
        
        float rimDot = 1.0 - max(dot(viewDir, normal), 0.0);
        float rimAmount = smoothstep(0.6, 1.0, rimDot);
        vec3 rimLight = vec3(0.4, 0.5, 0.8) * rimAmount * 0.4;
        
        vec3 finalColor = materialColor * (ambient + diffuse) + specular + rimLight;
        
        gl_FragColor = vec4(finalColor * intensity, 1.0);
    }
`;

// Factory: creates a ShaderMaterial with the given options
export function createTorusPressureMaterial(options = {}) {
    const {
        intensity = 1.5,
        gain = 1.0,
        isErrorMode = false,
    } = options;

    return new THREE.ShaderMaterial({
        vertexShader: torusPressureVertexShader,
        fragmentShader: torusPressureFragmentShader,
        uniforms: {
            dataTexture: { value: null },
            intensity: { value: intensity },
            gain: { value: gain },
            isErrorMode: { value: isErrorMode ? 1.0 : 0.0 },
        },
        side: THREE.DoubleSide,
    });
}