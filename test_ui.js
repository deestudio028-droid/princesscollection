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
  
  console.log("Waiting for form...");
  await page.waitForSelector('input[type="email"]');
  
  console.log("Filling form...");
  await page.type('input[type="email"]', 'admin@princess.com');
  await page.type('input[type="password"]', 'adminpc');
  
  console.log("Submitting...");
  await page.click('button[type="submit"]');

  console.log("Waiting for 10 seconds to allow data to load...");
  await new Promise(r => setTimeout(r, 10000));
  
  let text = await page.evaluate(() => document.body.innerText);
  let match = text.match(/ACTIVE ORDERS\n?(\d+)\s*orders/);
  console.log("Extracted Active Orders (After Login):", match ? match[1] : 'Not Found');

  const ls = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.includes('supabase'));
  });
  console.log("Supabase localStorage keys after login:", ls);

  console.log("Refreshing the page...");
  await page.reload({ waitUntil: 'networkidle2' });

  console.log("Waiting for 10 seconds to allow data to load...");
  await new Promise(r => setTimeout(r, 10000));

  text = await page.evaluate(() => document.body.innerText);
  match = text.match(/ACTIVE ORDERS\n?(\d+)\s*orders/);
  console.log("Extracted Active Orders (After Refresh):", match ? match[1] : 'Not Found');
  if (!match) {
    console.log("Full page text after refresh:\n", text);
  }

  await browser.close();
})();
