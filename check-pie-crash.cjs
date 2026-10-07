const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

  console.log("Navigating to dashboard...");
  await page.goto('http://localhost:5173/dashboard');
  
  // Inject exactly 1 water glass to trigger PieChart crash
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('water_glasses_history', JSON.stringify({
      [new Date().toDateString()]: 1
    }));
  });

  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done.");
  await browser.close();
})();
