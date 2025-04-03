const http = require("http");
const fs = require('fs');
const path = require('path');

const pathToIndex = path.join(__dirname, 'static', 'index.html');
const indexHTMLFile = fs.readFileSync(pathToIndex);

const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'))
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'))

const server = http.createServer((req, res) => {
    switch(req.url) {
        case '/': return res.end(indexHTMLFile);
        case '/script.js': return res.end(scriptFile);
        case '/style.css': return res.end(styleFile);
    }

    res.statusCode = 404;
    return res.end("ERROR 404, ТИ ХТО?")
});

server.listen(3000);