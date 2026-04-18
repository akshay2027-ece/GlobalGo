require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5500"
}));
app.use(express.json());

// Database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Test DB connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("MySQL Connected...");
        connection.release();
    }
});

// CREATE
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Data saved successfully!" });
    });
});

// READ
app.get("/api/contact", (req, res) => {
    db.query("SELECT * FROM contacts", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(result);
    });
});

// UPDATE
app.put("/api/contact/:id", (req, res) => {
    const { name, email, message } = req.body;
    const { id } = req.params;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "UPDATE contacts SET name=?, email=?, message=? WHERE id=?";
    db.query(sql, [name, email, message, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({ message: "Updated successfully!" });
    });
});

// DELETE
app.delete("/api/contact/:id", (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM contacts WHERE id=?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({ message: "Deleted successfully!" });
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});