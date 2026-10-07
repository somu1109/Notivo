const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

  console.log("Navigating to home...");
  await page.goto('http://localhost:5173/home');
  
  console.log("Waiting 10 seconds...");
  await new Promise(r => setTimeout(r, 10000));
  
  console.log("Done.");
  await browser.close();
})();
