const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

  console.log("Navigating to home...");
  await page.goto('http://localhost:5173/home');
  
  // Click Start
  await page.click('button:has-text("Start")');
  console.log("Clicked Start!");

  // Wait 10 seconds
  for (let i=0; i<10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const time = await page.locator('div[style*="font-size: 6rem"]').innerText();
    console.log("Time:", time);
  }

  await browser.close();
})();
