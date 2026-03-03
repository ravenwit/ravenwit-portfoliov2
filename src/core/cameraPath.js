import * as THREE from 'three';
import { CAREER_NODES } from '../config.js';

export function buildCameraPath() {
    const curvePoints = [
        new THREE.Vector3(0, 20, 150),
        new THREE.Vector3(0, 20, 100),
        new THREE.Vector3(0, 20, 50)
    ];
    CAREER_NODES.forEach((node, i) => {
        const midZ = (curvePoints[curvePoints.length - 1].z + node.z) / 2;
        curvePoints.push(new THREE.Vector3((i % 2 === 0 ? 30 : -30), 20, midZ));
        curvePoints.push(new THREE.Vector3(node.x, 0, node.z));
    });
    if (CAREER_NODES.length > 0) {
        const lastNode = CAREER_NODES[CAREER_NODES.length - 1];
        // Create a straight runway past the final node (2026) so the camera rockets perfectly straight into the void!
        // By keeping the x and y identical to the last node, `lookAt` won't drift diagonally.
        const finalZ = lastNode.z - 600;
        curvePoints.push(new THREE.Vector3(lastNode.x, lastNode.y, finalZ));
    } else {
        curvePoints.push(new THREE.Vector3(0, 30, -600));
    }

    const cameraPath = new THREE.CatmullRomCurve3(curvePoints);
    cameraPath.tension = 0.3;
    return cameraPath;
}
