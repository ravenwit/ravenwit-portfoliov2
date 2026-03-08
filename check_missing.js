import fs from 'fs';

const hobbiesFile = 'public/data/hobbies.json';
const iconsDir = 'public/icons';

const rawData = fs.readFileSync(hobbiesFile, 'utf8');
const dataStr = rawData.substring(rawData.indexOf('['), rawData.lastIndexOf(']') + 1);
const hobbies = eval(`(${dataStr})`);

const existingFiles = fs.readdirSync(iconsDir);
const expectedNames = [];

hobbies.forEach(category => {
  category.items.forEach(item => {
    const fileName = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    expectedNames.push(fileName);
  });
});

const missing = expectedNames.filter(name => !existingFiles.includes(name));

console.log("Total Hobbies:", expectedNames.length);
console.log("Total Icons mapped to Hobbies:", existingFiles.filter(f => expectedNames.includes(f)).length);
console.log("Missing Icons:", missing);
