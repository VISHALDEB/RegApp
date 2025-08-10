const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // For password hashing

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const usersFile = path.join(__dirname, "users.json");
let users = [];

// Load existing users
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

// Register
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "All fields required" });
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ success: true, message: "User registered" });
});

// Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    res.json({ success: true, message: "Login successful" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
