const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning')
            errors.push('CONSOLE ' + msg.type().toUpperCase() + ': ' + msg.text());
    });
    try {
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(3000);
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(3000);
    } catch (e) {
        errors.push('SCRIPT ERROR: ' + e.message);
    }
    console.log(JSON.stringify(errors, null, 2));
    await browser.close();
})();
