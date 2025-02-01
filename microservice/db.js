import sqlite3 from 'sqlite3';

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

export default db;