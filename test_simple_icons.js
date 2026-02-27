import * as simpleIcons from 'simple-icons';
let keys = Object.keys(simpleIcons);
console.log("Photoshop:", keys.find(k => k.toLowerCase().includes('photoshop')));
console.log("Lightroom:", keys.find(k => k.toLowerCase().includes('lightroom')));
console.log("Premiere:", keys.find(k => k.toLowerCase().includes('premiere')));
console.log("Visual Studio:", keys.find(k => k.toLowerCase().includes('visualstudio')));
console.log("Visual Basic:", keys.find(k => k.toLowerCase().includes('visualbasic')));
