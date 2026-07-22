import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://localhost:5174/');
    await new Promise(r => setTimeout(r, 2000));
    
    await page.evaluate(() => {
        const isingTitle = Array.from(document.querySelectorAll('h1')).find(h => h.textContent.includes('SPIN LATTICE'));
        if (isingTitle) {
            isingTitle.scrollIntoView({ behavior: 'instant', block: 'center' });
        } else {
            window.scrollBy(0, 3000);
        }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'ising_exhibit.png' });
    console.log('Screenshot saved to ising_exhibit.png');
    
    await browser.close();
})();
