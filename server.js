const http = require("http");
const fs = require('fs');
const path = require('path');

const db = require('./database');

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

const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', async (socket) => {
    console.log("User is connect, id: " + socket.id);

    let userNickname = 'user';
    let messages = await db.getMessages();

    socket.emit('all_messages', messages);

    socket.on('new_message', (message) => {
        db.addMessage(message, 1);
        io.emit('message', `${userNickname}: ${message}`);
    });
});