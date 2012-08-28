var http = require('http');
var fs = require('fs');

// Check port number
var port = process.env.PORT || parseInt(process.argv[2]);
if (!port) {
    console.log('ERROR: no port number provided.');
    console.log('Please run as: node static.js <port>');
    return;
}

// mime types
var mimes= {
    html: 'text/html',
    xhtml: 'text/xml',
    xsl: 'text/xsl',
    js: 'text/javascript',
    css: 'text/css',
    jpg: 'image/jpeg',
    png: 'image/png',
    ico: 'image/ico',
    svg: 'image/svg+xml'
}

// Run web server
http.createServer(function(req, res) {
    var filename = req.url.match('^/+([^?]*)')[1];
    serveFile(res, filename || 'index.html');
}).listen(port);

function serveFile(res, filename) {
    var mime= mimes[filename.replace(/[^.]*\./g,'')];
    fs.readFile(filename, function(err, data) {
	if (data) {
	    res.writeHead(200, { 'Content-Type': mime || 'text/plain'});
	    res.end(data)
	} else {
	    res.writeHead(404, { 'Content-Type': 'text/plain' });
	    res.end('File does not exist.');
	}
    });
}
