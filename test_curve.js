import * as THREE from 'three';

const CAREER_NODES = [
    {x: -25, y: 10, z: -100},
    {x: -30, y: 0, z: -300},
    {x: -30, y: 0, z: -500},
    {x: 40, y: -5, z: -700},
    {x: 20, y: 15, z: -1100},
    {x: -35, y: -10, z: -1300},
    {x: 30, y: 5, z: -1400},
];

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
const finalZ = CAREER_NODES[CAREER_NODES.length - 1].z - 450;
curvePoints.push(new THREE.Vector3(0, 30, finalZ));

const cameraPath = new THREE.CatmullRomCurve3(curvePoints);
cameraPath.tension = 0.3;

for (let i=0; i<=100; i+=5) {
    const p = cameraPath.getPointAt(i/100);
    console.log(`Progress: ${i/100}, Z: ${p.z}`);
}
