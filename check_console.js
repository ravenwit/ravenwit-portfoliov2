import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        console.log('BROWSER CONSOLE:', msg.type(), msg.text());
    });
    
    page.on('pageerror', err => {
        console.log('BROWSER ERROR:', err.toString());
    });
    
    await page.goto('http://localhost:5173/');
    
    // Wait for hero to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Trigger transition to works (simulate clicking vortex or calling initiateHeroToWorks)
    await page.evaluate(() => {
        window.dispatchEvent(new MouseEvent('click', { clientX: window.innerWidth * 0.7, clientY: window.innerHeight * 0.7 }));
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Click the next button in carousel to go to GeoFNO
    await page.evaluate(() => {
        const nextBtn = document.getElementById('works-next');
        if (nextBtn) nextBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();
