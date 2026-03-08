export const starVertexShader = `
    uniform float uTime; uniform float uCameraZ; uniform float uSpeed; 
    uniform int uMassCount;
    uniform vec3 uMassPositions[10]; uniform float uMassStrengths[10];
    uniform vec3 uCameraPos; uniform float uLensing; uniform float uOpacity;
    attribute float size; attribute vec3 basePos; varying float vAlpha;
    void main() {
        vec3 pos = basePos;
        float wrapDepth = 1000.0;
        float relZ = pos.z - uCameraZ;
        float wrappedZ = mod(relZ + 500.0, wrapDepth) - 500.0;
        pos.z = uCameraZ + wrappedZ;
        vec3 viewDir = normalize(pos - uCameraPos);
        vec3 lensingOffset = vec3(0.0);
        for(int i = 0; i < 10; i++) {
            if (i >= uMassCount) break;
            vec3 massToCam = uMassPositions[i] - uCameraPos;
            float distToMass = length(massToCam);
            vec3 massDir = normalize(massToCam);
            float cosTheta = dot(viewDir, massDir);
            if (cosTheta > 0.9) { 
                float angle = acos(clamp(cosTheta, -1.0, 1.0));
                float thetaE = sqrt(uMassStrengths[i] * uLensing * 0.00002);
                float deflection = (thetaE * thetaE) / max(angle, 0.005);
                vec3 perp = normalize(viewDir - massDir * cosTheta);
                lensingOffset += perp * deflection * distToMass;
            }
        }
        vec4 mvPosition = viewMatrix * vec4(pos + lensingOffset, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float dist = length(mvPosition.xyz);
        float sizeFactor = size * (400.0 / dist);
        float twinkle = sin(uTime * 3.0 + basePos.x);
        gl_PointSize = sizeFactor * (1.0 + uSpeed * 0.1 + twinkle * 0.3);
        vAlpha = uOpacity * (0.5 + 0.5 * twinkle) * (1.0 - smoothstep(400.0, 500.0, abs(wrappedZ)));
    }
`;
