import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.error('PAGE REQUEST FAILED:', request.url(), request.failure().errorText));

  // Navigate to local server
  await page.goto('http://localhost:5173');
  
  console.log('Waiting for load...');
  // Wait a bit for the loader to finish (it says "setTimeout(() => document.getElementById('ui-hero').style.opacity = 1, 1000);" so wait ~2s after 100%)
  await page.waitForTimeout(3000);
  
  console.log('Scrolling down to trigger transition...');
  // Trigger a wheel event downwards
  await page.mouse.wheel(0, 500);
  
  await page.waitForTimeout(2000);
  
  console.log('Done.');
  await browser.close();
})();
