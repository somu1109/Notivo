const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

  console.log("Navigating to home...");
  await page.goto('http://localhost:5173/home');
  
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('study_sessions', 'INVALID JSON');
    localStorage.setItem('daily_goals', 'INVALID JSON');
    localStorage.setItem('reminder_tasks', 'INVALID JSON');
    localStorage.setItem('water_glasses_history', 'INVALID JSON');
  });

  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done.");
  await browser.close();
})();
