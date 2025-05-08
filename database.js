const fs = require('fs');

const dbFile = "./chat.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const dbWrapper = require('sqlite')
let db;

dbWrapper
    .open({
        filename: dbFile,
        driver: sqlite3.Database
    })
    .then(async dBase => {
        db = dBase;
        try {
            if (!exists) {
                await db.run(
                    `CREATE TABLE user(
                        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        login TEXT UNIQUE,
                        password TEXT
                    );`
                );

                await db.run(
                    `INSERT INTO user (login, password) VALUES
                        ('Stepan', '123456'),
                        ('Artem', '123321'),
                        ('Maksimka', '111222333');
                    `
                )

                await db.run(
                    `CREATE TABLE message(
                        msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        content TEXT,
                        author INTEGER,

                        FOREIGN KEY(author) REFERENCES user(user_id)
                    );`
                )
            } else {
                console.log("Data Base is ok!")
            }
        } catch (error) {
            console.error(error);
        }
    })



module.exports = {
    getMessages: async () => {
        try {
            return await db.all(
                `SELECT msg_id, content, login, user_id FROM message
                JOIN user ON message.author = user.user_id;
                `
            )
        } catch (error) {
            console.error(error)
        }
    },

    addMessage: async (msg, userId) => {
        await db.run(
            `INSERT INTO message (content, author) VALUES (?, ?)`,
            [msg, userId]
        )
    },

    isUserExist: async (login) => {
        const condidate = await db.all(
            'SELECT * FROM user WHERE login = ?',
            [login]
        );

        return !!condidate.length;
    },

    /**
     * Додає користувача
     * @param {Object} user
     * @param {string} user.login
     * @param {string} user.password
     */
    addUser: async (user) => {
        await db.run(
            'INSERT INTO user (login, password) VALUES (?, ?)',
            [user.login, user.password]
        )
    }
}