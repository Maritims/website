import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000

const db = new sqlite3.Database('hitCounter.db', (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    }
    console.log("Connected to the SQLite database.");

    db.run(`CREATE TABLE IF NOT EXISTS hit_count (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count INTEGER NOT NULL
        )`,
        (err) => {
            if (err) {
                console.error("Failed to create table:", err);
                process.exit(1);
            }

            db.get("SELECT count FROM hit_count ORDER BY id DESC LIMIT 1", (err, row) => {
                if (err) {
                    console.error("Error fetching initial count:", err);
                    process.exit(1);
                }

                if (!row) {
                    db.run("INSERT INTO hit_count (count) VALUES(?)", [0], (err) => {
                        if (err) {
                            console.error("Failed to insert initial count:", err);
                            process.exit(1);
                        }
                    });
                }
            });
        });
});

app.get("/hit", (req, res) => {
    db.run("UPDATE hit_count SET count = count + 1", (err) => {
        if(err) {
            console.error("Failed to increment hit count:", err);
            return res.status(500).json({
                error: "Failed to update hit count"
            });
        }

        db.get("SELECT count FROM hit_count ORDER BY id DESC LIMIT 1", (err, row) => {
            if(err) {
                console.error("Error fetching hit count:", err);
                return res.status(500).json({
                    error: "failed to fetch hit count"
                });
            }

            res.json({ hitCount: row.count });
        })
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});