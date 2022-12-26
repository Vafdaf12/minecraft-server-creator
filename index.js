const dns = require("dns");

async function checkConnection(url) {
  return new Promise(resolve => {
    dns.resolve(url, err => {
      if(err) {
        resolve(false)
        console.log(err.message);
      }
      else resolve(true)
      
    })
    
  });
}

(async () => {
  const a = await checkConnection("https://google.com");
  console.log(a);
})()