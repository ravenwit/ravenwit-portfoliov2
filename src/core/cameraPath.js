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
    curvePoints.push(new THREE.Vector3(0, 30, -600));
    const cameraPath = new THREE.CatmullRomCurve3(curvePoints);
    cameraPath.tension = 0.3;
    return cameraPath;
}
