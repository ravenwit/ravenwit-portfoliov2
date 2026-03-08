import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`[pageerror] ${err.toString()}`);
  });

  try {
    await page.goto('http://localhost:5173/');
    await new Promise(r => setTimeout(r, 2000));
    await page.mouse.wheel({ deltaY: 200 }); // trigger timeline
    await new Promise(r => setTimeout(r, 2000));

    console.log(JSON.stringify(errors, null, 2));
  } catch (err) {
    console.error("Script error:", err);
  } finally {
    await browser.close();
  }
})();
