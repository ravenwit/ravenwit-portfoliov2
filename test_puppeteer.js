const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('console', msg => {
        if(msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    });
    try {
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(3000);
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(2000);
    } catch(e) {}
    await browser.close();
})();
