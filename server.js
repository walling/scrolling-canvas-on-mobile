var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

http.createServer(function(request, response) {
	var location = url.parse(request.url);
	var filename = location.pathname.slice(1) || 'index.html';
	fs.readFile(path.resolve(__dirname, filename), function(err, data) {
		if (err) {
			response.writeHead(500);
			response.end(err.stack);
		} else {
			response.writeHead(200, {
				'content-type': path.extname(filename) === '.js' ?
					'application/ecmascript' :
					'text/html'
			});
			response.end(data);
		}
	});
}).listen(3000);
