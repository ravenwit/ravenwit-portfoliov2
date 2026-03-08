import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');

  // Wait for load
  await new Promise(r => setTimeout(r, 2000));

  // Execute JS to force opacity and check
  const data = await page.evaluate(() => {
    const el = document.querySelector('.eigenstate-layer');
    if (!el) return 'No layer';
    el.style.opacity = '1';
    el.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Forcing red background to trace bounds
    
    // items
    const items = document.querySelectorAll('.eigenstate-item');
    items.forEach(i => i.classList.add('active'));
    
    return {
      opacity: window.getComputedStyle(el).opacity,
      itemsCount: items.length,
      rect: el.getBoundingClientRect().toJSON(),
      gridRect: document.querySelector('#eigenstate-grid').getBoundingClientRect().toJSON()
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
