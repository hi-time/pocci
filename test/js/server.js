require('http').createServer(function (req, res) {
  var url = require('url').parse(req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
  process.exit(url.path.substring(1));
}).listen(9898);
