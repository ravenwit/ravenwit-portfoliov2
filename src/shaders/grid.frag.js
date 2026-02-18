export const gridFragmentShader = `
    varying float vDistortion; uniform float uOpacity;
    void main() {
        vec3 color = vec3(0.1, 0.3, 0.4);
        float shift = smoothstep(-2.0, -25.0, vDistortion);
        color = mix(color, vec3(0.8, 0.3, 0.2), shift); 
        float alpha = 0.5 + (shift * 0.5);
        vec2 coord = gl_PointCoord - vec2(0.5);
        if(abs(coord.x) > 0.45 || abs(coord.y) > 0.45) discard;
        gl_FragColor = vec4(color, uOpacity * alpha);
    }
`;
