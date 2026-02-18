export const starFragmentShader = `
    varying float vAlpha;
    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        if(length(coord) > 0.5) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * pow(1.0 - length(coord)*2.0, 2.0));
    }
`;
