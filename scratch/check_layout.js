const https = require('https');

https.get('https://www.princesscollection.it.com/admin', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const jsFiles = [...body.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
    
    jsFiles.forEach(file => {
      https.get(`https://www.princesscollection.it.com${file}`, (jsRes) => {
        let jsBody = '';
        jsRes.on('data', chunk => jsBody += chunk);
        jsRes.on('end', () => {
          if (jsBody.includes('/admin/orders')) {
            console.log(`Found /admin/orders in ${file}`);
          }
          if (jsBody.includes('/admin/customers')) {
            console.log(`Found /admin/customers in ${file}`);
          }
        });
      });
    });
  });
}).on('error', console.error);
