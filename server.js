const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("myhost.db");

app.use(cors());
app.use(express.json());

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
`).run();

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.json({
            success: false,
            message: "Semua data harus diisi"
        });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        db.prepare(`
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
        `).run(username, email, hash);

        res.json({
            success: true,
            message: "Register berhasil"
        });

    } catch {
        res.json({
            success: false,
            message: "Username atau email sudah digunakan"
        });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare(
        "SELECT * FROM users WHERE username = ?"
    ).get(username);

    if (!user) {
        return res.json({
            success: false,
            message: "Username atau password salah"
        });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.json({
            success: false,
            message: "Username atau password salah"
        });
    }

    res.json({
        success: true,
        username: user.username
    });
});

app.listen(3000, () => {
    console.log("MY HOST berjalan di http://localhost:3000");
});
