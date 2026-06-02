const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('UNCAUGHT EXCEPTION:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navigating to https://princesscollection.it.com/ ...");
  await page.goto('https://princesscollection.it.com/', { waitUntil: 'networkidle2' });
  
  const storefrontText = await page.evaluate(() => document.body.innerText);
  console.log("Does storefront have products?:", storefrontText.includes('₹'));

  console.log("Navigating to admin...");
  await page.goto('https://princesscollection.it.com/admin', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@princess.com');
  await page.type('input[type="password"]', 'adminpc');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.body.innerText);
  const match = text.match(/ACTIVE ORDERS\n?(\d+)\s*orders/);
  console.log("Extracted Active Orders:", match ? match[1] : 'Not Found');

  console.log("Clicking Sync Data button...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const syncBtn = btns.find(b => b.innerText.includes('Sync Data'));
    if (syncBtn) syncBtn.click();
  });

  await new Promise(r => setTimeout(r, 5000));

  const textAfterSync = await page.evaluate(() => document.body.innerText);
  const matchAfterSync = textAfterSync.match(/ACTIVE ORDERS\n?(\d+)\s*orders/);
  console.log("Extracted Active Orders (After Sync):", matchAfterSync ? matchAfterSync[1] : 'Not Found');

  await browser.close();
})();
