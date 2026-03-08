const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(3000);
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(1000);
        // Look for Vite error overlay
        const viteError = await page.evaluate(() => {
            const overlay = document.querySelector('vite-error-overlay');
            if (overlay && overlay.shadowRoot) {
                return overlay.shadowRoot.querySelector('.message-body').innerText;
            }
            return null;
        });
        if(viteError) console.log('VITE ERROR:', viteError);
        
        const logs = await page.evaluate(() => window.__logs);
    } catch(e) {}
    await browser.close();
})();
