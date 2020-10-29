var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('lab4.html');
var js = fs.readFileSync('lab4.js');

http.createServer(function (req, res) {
	if (req.url === '/lab4.js') {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(js);
	} else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index);
	}
}).listen(3000);