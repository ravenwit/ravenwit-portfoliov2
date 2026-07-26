const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5174/');
  
  // Wait for the geofno exhibit to be shown by navigating to it
  await page.click('#works-next'); // From Megh to Geofno
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'geofno.png' });
  await browser.close();
})();
