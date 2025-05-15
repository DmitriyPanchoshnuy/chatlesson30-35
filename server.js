const http = require("http");
const fs = require('fs');
const path = require('path');

const db = require('./database');

const pathToIndex = path.join(__dirname, 'static', 'index.html');
const indexHTMLFile = fs.readFileSync(pathToIndex);

const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'))
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'))
const authFile = fs.readFileSync(path.join(__dirname, 'static', 'auth.js'))
const registerFile = fs.readFileSync(path.join(__dirname, 'static', 'register.html'))

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        switch (req.url) {
            case '/': return res.end(indexHTMLFile);
            case '/script.js': return res.end(scriptFile);
            case '/style.css': return res.end(styleFile);
            case '/auth.js': return res.end(authFile);
            case '/register': return res.end(registerFile);
        }
    }

    if (req.method === 'POST') {
        switch (req.url) {
            case '/api/register': return registerUser(req, res);
            case '/api/login': return login(req, res);
        }
    }

    res.statusCode = 404;
    return res.end("ERROR 404, ТИ ХТО?")
});

function registerUser(req, res) {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    })

    req.on('end', async () => {
        try {
            const user = JSON.parse(data);
            if ( !user.login || !user.password) {
                return res.end("Empty login or password!")
            }

            if ( await db.isUserExist(user.login)) {
                return res.end("User already exist!")
            }

            await db.addUser(user);
            return res.end("Registeration is successfull!")
        } catch (e) {
            return res.end('Error: ' + e);
        }
    })
    
}

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