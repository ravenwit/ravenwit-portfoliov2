export const gridVertexShader = `
    uniform float uTime; 
    uniform int uMassCount;
    uniform vec3 uMassPositions[10]; 
    uniform float uMassStrengths[10];
    uniform float uOpacity; attribute vec3 basePos; varying float vDistortion; varying float vDepth;
    void main() {
        vec3 pos = basePos;
        float totalDisplacement = 0.0;
        for(int i = 0; i < 10; i++) {
            if (i >= uMassCount) break;
            float dx = pos.x - uMassPositions[i].x;
            float dz = pos.z - uMassPositions[i].z;
            float distSq = dx*dx + dz*dz;
            float decay = 0.4 / (uMassStrengths[i] + 10.0);
            decay = clamp(decay, 0.002, 0.02);
            float force = uMassStrengths[i] * exp(-distSq * decay);
            totalDisplacement -= force;
        }
        pos.y += totalDisplacement;
        vDistortion = totalDisplacement;
        vDepth = -pos.z;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = 2.0 * (100.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.5, 3.5); 
    }
`;
