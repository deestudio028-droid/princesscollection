const https = require('https');

https.get('https://www.princesscollection.it.com/admin/orders', (res) => {
  console.log('Status Code:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
