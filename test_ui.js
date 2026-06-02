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

  console.log("Navigating to https://princesscollection.it.com/admin ...");
  await page.goto('https://princesscollection.it.com/admin', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'princesscollection7799@gmail.com');
  await page.type('input[type="password"]', 'adminpc'); // wait, I don't know this password! 
  // Let me use admin@princess.com instead, since it is ALSO an admin!
  
  // Wait, I will just use admin@princess.com
  
  await page.evaluate(() => {
    document.querySelector('input[type="email"]').value = '';
    document.querySelector('input[type="password"]').value = '';
  });
  
  await page.type('input[type="email"]', 'admin@princess.com');
  await page.type('input[type="password"]', 'adminpc');
  
  await page.click('button[type="submit"]');

  console.log("Waiting 5 seconds for dashboard...");
  await new Promise(r => setTimeout(r, 5000));
  
  const textAfterLogin = await page.evaluate(() => document.body.innerText);
  console.log("Page text after login:", textAfterLogin.substring(0, 200));

  await browser.close();
})();
