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
    
    console.log('Waiting for state to reach HERO...');
    await page.waitForFunction(() => {
        return document.getElementById('status-display')?.innerText === 'SYSTEM_READY';
    }, { timeout: 20000 });

    await new Promise(r => setTimeout(r, 1500));

    console.log('Triggering Hero to Timeline transition...');
    await page.evaluate(async () => {
        const mod = await import('/src/core/transitions.js');
        mod.initiateHeroToTimeline();
    });

    await new Promise(r => setTimeout(r, 600));

    const checkOverlayActive = await page.evaluate(() => {
        const overlay = document.getElementById('timeline-transition-overlay');
        const style = window.getComputedStyle(overlay);
        const title = overlay.querySelector('.timeline-transition-title')?.innerText;
        const cardsCount = overlay.querySelectorAll('.guide-card').length;
        return {
            display: style.display,
            opacity: style.opacity,
            title,
            cardsCount
        };
    });

    console.log('TRANSITION OVERLAY DURING TRANSITION:', checkOverlayActive);

    await new Promise(r => setTimeout(r, 2000));

    const checkOverlayAfter = await page.evaluate(() => {
        const overlay = document.getElementById('timeline-transition-overlay');
        const style = window.getComputedStyle(overlay);
        const hud = document.getElementById('hud');
        return {
            overlayDisplay: style.display,
            overlayOpacity: style.opacity,
            hudOpacity: window.getComputedStyle(hud).opacity
        };
    });

    console.log('AFTER TRANSITION COMPLETE:', checkOverlayAfter);

    await browser.close();
})();
