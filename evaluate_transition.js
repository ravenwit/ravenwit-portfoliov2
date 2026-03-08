import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if(msg.text().includes('TRANSITION')) {
            console.log('PAGE LOG:', msg.text());
        }
    });

    await page.goto('http://localhost:5173');
    
    // Wait for the hero to load
    await page.waitForSelector('#ui-hero', { visible: true });
    console.log("Hero loaded.");

    // Scroll into timeline
    console.log("Scrolling into timeline...");
    await page.mouse.wheel({ deltaY: 2000 });
    
    // Wait for timeline
    await new Promise(r => setTimeout(r, 1000));
    console.log("Scrolling through timeline...");
    
    // Scroll massively to hit the end of the timeline
    for (let i = 0; i < 30; i++) {
        await page.mouse.wheel({ deltaY: 500 });
        await new Promise(r => setTimeout(r, 100));
    }
    
    // Evaluate if transitioning happened
    const phase = await page.evaluate(() => {
        return window.__STATE__ ? window.__STATE__.phase : 'no state exposed';
    });
    
    console.log(`Final phase: ${phase}`);
    
    const uiOpacity = await page.evaluate(() => {
        const el = document.getElementById('ui-research');
        return el ? el.style.opacity : 'no ui-research';
    });
    console.log(`UI Research Opacity: ${uiOpacity}`);
    
    await browser.close();
})();
