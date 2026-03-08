const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('pageerror', err => {
        console.error('!!! PAGE ERROR !!! \n\n', err.message, err.stack);
        process.exit(1);
    });
    page.on('console', msg => {
        console.log('LOG:', msg.text());
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    console.log("Scrolling...");
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(3000);
    await browser.close();
})();
