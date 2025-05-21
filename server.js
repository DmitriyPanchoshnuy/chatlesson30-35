const http = require("http");
const fs = require('fs');
const path = require('path');
const cookie = require('cookie')

const db = require('./database');

let validAuthTokens = [];

const pathToIndex = path.join(__dirname, 'static', 'index.html');
const indexHTMLFile = fs.readFileSync(pathToIndex);

const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'))
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'))
const authFile = fs.readFileSync(path.join(__dirname, 'static', 'auth.js'))
const registerFile = fs.readFileSync(path.join(__dirname, 'static', 'register.html'))
const loginFile = fs.readFileSync(path.join(__dirname, 'static', 'login.html'))

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // Для НЕ авторизованих користувачів
        switch (req.url) {
            case '/style.css': return res.end(styleFile);
            case '/auth.js': return res.end(authFile);
            case '/register': return res.end(registerFile);
            case '/login': return res.end(loginFile);
            default: return guarded(req, res);
        }
    }

    if (req.method === 'POST') {
        switch (req.url) {
            case '/api/register': return registerUser(req, res);
            case '/api/login': return login(req, res);
            default: return guarded(req, res);
        }
    }
});

function guarded(req, res) {
    const credentionals = getCredentionals(req);
    if (!credentionals) {
        res.writeHead(401, {'Location': '/register'});
    }

    if (req.method === 'GET') {
        // Для авторизованих користувачів
        switch(req.url) {
            case '/': return res.end(indexHTMLFile);
            case '/script.js': return res.end(scriptFile);
        }
    }

    res.writeHead(404);
    return res.end('Error 404')
}

function getCredentionals(req) {
    const cookies = cookie.parse(req.header?.cookie || '');
    const token = cookies?.token;
    if (!token || !validAuthTokens.includes(token)) return null;
    const [user_id, login] = token.split('.');
    if (!user_id || !login) return null;

    return {user_id, login}
}

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

function login(req, res) {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    })

    req.on('end', async () => {
        try {
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            validAuthTokens.push(token);
            res.writeHead(200);
            res.end(token);
        } catch(e) {
            res.writeHead(500);
            return res.end("Error: " + e);
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