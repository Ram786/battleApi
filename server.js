const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
	// Callback triggered when server is successfully listening. Hurray!
	console.log('Server listening on: http://localhost:%s', port)
});