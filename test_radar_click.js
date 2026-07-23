import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });
    
    page.on('pageerror', err => {
        console.log('BROWSER UNCAUGHT ERROR:', err.toString());
    });
    
    await page.goto('http://localhost:5173/');
    
    console.log('Waiting for system ready...');
    await page.waitForFunction(async () => {
        try {
            const { STATE } = await import('/src/state.js');
            return STATE.phase === 'HERO';
        } catch {
            return false;
        }
    }, { timeout: 30000 });

    console.log('Initiating Timeline phase...');
    await page.evaluate(async () => {
        const mod = await import('/src/core/transitions.js');
        await mod.initiateHeroToTimeline();
    });

    // Wait for transition to complete
    await new Promise(r => setTimeout(r, 2500));

    // Check radar nodes count and properties
    const radarInfo = await page.evaluate(() => {
        const roundDots = Array.from(document.querySelectorAll('.radar-round-marker:not(#radar-round-player)'));
        const dialNodes = Array.from(document.querySelectorAll('.radar-node'));
        
        return {
            roundDotsCount: roundDots.length,
            dialNodesCount: dialNodes.length,
            roundDotTitles: roundDots.map(d => d.getAttribute('title')),
            dialNodeTitles: dialNodes.map(d => d.getAttribute('title')),
            roundDotPointerEvents: roundDots.map(d => window.getComputedStyle(d).pointerEvents)
        };
    });

    console.log('Radar Nodes Info:', JSON.stringify(radarInfo, null, 2));

    // Test clicking on round radar dot #2 (index 1)
    console.log('Simulating click on round radar dot #2...');
    const snapIndexBefore = await page.evaluate(async () => {
        const { STATE } = await import('/src/state.js');
        return STATE.activeSnapIndex;
    });

    await page.evaluate(async () => {
        const roundDots = document.querySelectorAll('.radar-round-marker:not(#radar-round-player)');
        if (roundDots[1]) {
            roundDots[1].click();
        }
    });

    await new Promise(r => setTimeout(r, 1000));

    const snapIndexAfterRoundClick = await page.evaluate(async () => {
        const { STATE } = await import('/src/state.js');
        return STATE.activeSnapIndex;
    });

    console.log(`Snap index before: ${snapIndexBefore}, Snap index after clicking round radar dot #2: ${snapIndexAfterRoundClick}`);

    // Test clicking on vertical dial node #3 (index 2)
    console.log('Simulating click on vertical dial node #3...');
    await page.evaluate(async () => {
        const dialNodes = document.querySelectorAll('.radar-node');
        if (dialNodes[2]) {
            dialNodes[2].click();
        }
    });

    await new Promise(r => setTimeout(r, 1000));

    const snapIndexAfterDialClick = await page.evaluate(async () => {
        const { STATE } = await import('/src/state.js');
        return STATE.activeSnapIndex;
    });

    console.log(`Snap index after clicking vertical dial node #3: ${snapIndexAfterDialClick}`);

    await browser.close();
    
    if (radarInfo.roundDotsCount > 0 && 
        radarInfo.dialNodesCount > 0 &&
        snapIndexAfterRoundClick === 1 &&
        snapIndexAfterDialClick === 2) {
        console.log('ALL RADAR INTERACTIVITY TESTS PASSED SUCCESSFULLY!');
        process.exit(0);
    } else {
        console.error('TEST FAILED!');
        process.exit(1);
    }
})();
