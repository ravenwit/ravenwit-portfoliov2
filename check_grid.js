import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');

  // Wait, scroll down
  await new Promise(r => setTimeout(r, 2000));
  await page.mouse.wheel({ deltaY: 200 });
  await new Promise(r => setTimeout(r, 1000));
  await page.mouse.wheel({ deltaY: 200 });
  await new Promise(r => setTimeout(r, 1000));

  const data = await page.evaluate(() => {
    const layer = document.querySelector('.eigenstate-layer');
    if (!layer) return "No layer";
    
    const items = document.querySelectorAll('.eigenstate-item');
    return {
      layerStyle: {
        opacity: layer.style.opacity,
        display: window.getComputedStyle(layer).display,
        visibility: window.getComputedStyle(layer).visibility,
        zIndex: window.getComputedStyle(layer).zIndex
      },
      itemCount: items.length,
      item1: items.length ? {
        opacity: window.getComputedStyle(items[0]).opacity,
        rect: items[0].getBoundingClientRect().toJSON(),
        text: items[0].innerText
      } : null
    };
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
