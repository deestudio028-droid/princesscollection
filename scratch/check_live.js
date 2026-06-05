const https = require('https');

https.get('https://www.princesscollection.it.com/admin/products', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // Check if the HTML contains references to my newly added code
    const hasBucket = body.includes('princess_images');
    const hasOptimistic = body.includes('Adding Product...'); // This was there before too
    console.log('HTML check complete.');
    console.log('Has princess_images (bucket):', hasBucket);
    
    // Find JS bundles
    const jsFiles = [...body.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
    console.log('Found JS files:', jsFiles.length);
    
    let checked = 0;
    let foundBucketInJs = false;
    
    if (jsFiles.length === 0) {
      console.log('No JS files found.');
      return;
    }
    
    jsFiles.forEach(file => {
      https.get(`https://www.princesscollection.it.com${file}`, (jsRes) => {
        let jsBody = '';
        jsRes.on('data', chunk => jsBody += chunk);
        jsRes.on('end', () => {
          if (jsBody.includes('princess_images')) {
            foundBucketInJs = true;
          }
          checked++;
          if (checked === jsFiles.length) {
            console.log('JS check complete. Has princess_images:', foundBucketInJs);
          }
        });
      });
    });
  });
}).on('error', console.error);
