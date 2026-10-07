const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/dashboard');
  await new Promise(r => setTimeout(r, 1000));
  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot-dash.png' });
  
  await browser.close();
})();
