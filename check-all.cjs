const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('ERROR:', err.message));

  for (const path of ['/dashboard', '/home', '/study', '/goals', '/tasks', '/water']) {
    console.log(`Checking ${path}...`);
    await page.goto(`http://localhost:5173${path}`);
    await new Promise(r => setTimeout(r, 1000));
    const title = await page.title();
    const content = await page.locator('h1').innerText().catch(() => 'no h1');
    console.log(`-> Title: ${title}, H1: ${content}`);
  }

  await browser.close();
})();
