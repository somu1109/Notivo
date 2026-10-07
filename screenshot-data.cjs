const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/dashboard');
  
  // Inject some data
  await page.evaluate(() => {
    localStorage.setItem('study_sessions', JSON.stringify([
      { id: '1', date: new Date().toDateString(), segments: [{ type: 'Study', start: Date.now() - 3600000, end: Date.now() }] }
    ]));
    localStorage.setItem('daily_goals', JSON.stringify([
      { id: '2', date: new Date().toDateString(), text: 'Test', done: true }
    ]));
    localStorage.setItem('water_glasses_history', JSON.stringify({
      [new Date().toDateString()]: 5
    }));
  });

  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot-data.png' });
  
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await browser.close();
})();
