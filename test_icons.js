import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    const filePath = 'file://' + path.join(__dirname, 'Resources', 'hobbies eigenstate v2.html');
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    await page.screenshot({ path: 'test_hobbies_icons.png' });

    await browser.close();
    console.log("Screenshot saved to test_hobbies_icons.png");
})();
