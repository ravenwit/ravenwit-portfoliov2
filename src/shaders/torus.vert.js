export const torusVertexShader = `
    uniform float uTime; uniform float uNoiseTime; uniform float uTemperature; uniform float uStretch;
    attribute float aRandom; attribute vec3 aLatticePos; varying float vAlpha; varying vec3 vColor;
    vec3 getChaoticNoise(float time, float seed) {
        float t = time;
        float x = sin(t + seed * 100.0) + cos(t * 0.4 + seed * 43.0) * 1.5;
        float y = cos(t + seed * 76.0) + sin(t * 0.6 + seed * 21.0) * 1.5;
        float z = sin(t * 0.8 + seed * 123.0) + cos(t * 0.3 + seed * 99.0);
        return vec3(x, y, z);
    }
    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5); vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0); vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
    }
    void main() {
        vec3 targetPos = aLatticePos;
        vec3 noise = getChaoticNoise(uNoiseTime, aRandom);
        vec3 brownianTerm = noise * uTemperature;
        float dist = length(targetPos);
        float swirlAngle = uNoiseTime * 0.2 + dist * 0.05;
        float c = cos(swirlAngle); float s = sin(swirlAngle);
        mat2 rot = mat2(c, -s, s, c);
        if (uTemperature > 1.0) brownianTerm.xy = rot * brownianTerm.xy;
        vec3 pos = targetPos + brownianTerm;
        
        // STRETCH LOGIC (WARP EFFECT)
        pos.z += pos.z * uStretch * 2.0; 
        pos.z += uStretch * (aRandom * 100.0); 
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        float tempSize = clamp(uTemperature, 0.0, 20.0);
        float warpThinning = 1.0 / (1.0 + uStretch * 5.0);
        gl_PointSize = (2.0 + tempSize * 0.2) * (150.0 / -mvPosition.z) * warpThinning;
        
        float disorder = clamp(uTemperature / 15.0, 0.0, 1.0);
        vec3 nebulaColor = palette(length(pos) * 0.02 - uTime * 0.2 + aRandom);
        nebulaColor = mix(nebulaColor, vec3(1.0, 0.2, 0.8), 0.3);
        vec3 crystalColor = vec3(0.1, 0.9, 1.0);
        vColor = mix(crystalColor, nebulaColor, disorder);
        
        float twinkle = sin(uTime * 1.5 + aRandom * 100.0) * 0.5 + 0.5;
        float baseAlpha = mix(0.8, 0.25 + twinkle * 0.3, disorder);
        
        // ALPHA FADE ON STRETCH (CRITICAL FOR DISSOLVE EFFECT)
        vAlpha = baseAlpha * (1.0 - smoothstep(0.0, 15.0, uStretch));
    }
`;
