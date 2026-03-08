import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');

  // Wait for load and scroll
  await new Promise(r => setTimeout(r, 2000));
  await page.mouse.wheel({ deltaY: 200 }); // scroll into timeline
  await new Promise(r => setTimeout(r, 1000));
  await page.mouse.wheel({ deltaY: 200 }); // trigger threshold

  // Read DOM bounding rects and computed styles
  const data = await page.evaluate(() => {
    const layer = document.querySelector('.eigenstate-layer');
    const grid = document.querySelector('#eigenstate-grid');
    const items = document.querySelectorAll('.eigenstate-item');
    if (!layer || !grid || items.length === 0) return { error: "Missing DOM" };
    
    return {
      layerStyle: {
        opacity: layer.style.opacity,
        zIndex: window.getComputedStyle(layer).zIndex,
        width: window.getComputedStyle(layer).width,
        height: window.getComputedStyle(layer).height,
        display: window.getComputedStyle(layer).display
      },
      gridRect: grid.getBoundingClientRect().toJSON(),
      gridStyle: window.getComputedStyle(grid).transform,
      item1Rect: items[0].getBoundingClientRect().toJSON(),
      item1Style: {
        opacity: window.getComputedStyle(items[0]).opacity,
        transform: window.getComputedStyle(items[0]).transform,
        display: window.getComputedStyle(items[0]).display,
        animation: window.getComputedStyle(items[0]).animation
      },
      classNames: items[0].className
    };
  });

  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
