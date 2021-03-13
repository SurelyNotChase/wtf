const fs = require('fs');

const js = fs.readFileSync(`${__dirname}/../client/scripts.js`);

const getClientScript = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(js);
  response.end();
};

module.exports = {
  getClientScript,
};
