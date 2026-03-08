import fs from 'fs';

const hobbiesFile = 'public/data/hobbies.json';
const iconsDir = 'public/icons';

const rawData = fs.readFileSync(hobbiesFile, 'utf8');
const dataStr = rawData.substring(rawData.indexOf('['), rawData.lastIndexOf(']') + 1);
const hobbies = eval(`(${dataStr})`);

const existingFiles = fs.existsSync(iconsDir) ? fs.readdirSync(iconsDir) : [];
const missingItems = [];

hobbies.forEach(category => {
    category.items.forEach(item => {
        const fileName = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
        if (!existingFiles.includes(fileName)) {
            missingItems.push(item.name);
        }
    });
});

if (missingItems.length === 0) {
    console.log("No items are missing. All have icons.");
} else {
    missingItems.forEach(name => console.log(name));
}
