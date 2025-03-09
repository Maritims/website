import { Router } from 'express';
import { createConnection, run, findFirst } from '../lib/db.js';

let dbConnection;

const initHitCounter = async () => {
    dbConnection = await createConnection('hitCounter.db');

    await run(dbConnection,
        `CREATE TABLE IF NOT EXISTS hit_count
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            count INTEGER NOT NULL,
            created TEXT NOT NULL,
            lastUpdated TEXT NOT NULL
        )`
    );

    const count = await findFirst(dbConnection, 'hit_count');
    if (count === 0) {
        const now = new Date();
        await run(
            dbConnection,
            `INSERT INTO hit_count (count, created, lastUpdated) VALUES (?, ?, ?)`,
            [0, now.toISOString(), now.toISOString()]
        );
        console.log("Created initial row");
    }
}

const hitCounter = Router();

hitCounter.use((req, res, next) => {
    if (dbConnection) {
        next();
    } else {
        res.status(500).json({ error: "No database connection has been established." });
    }
});

hitCounter.post("/", async (req, res) => {
    await run(dbConnection, `UPDATE hit_count SET count = count + 1, lastUpdated = ?`, [new Date().toISOString()]);
    const result = await findFirst(dbConnection, "hit_count");
    res.json({ hitCount: result.count });
});

hitCounter.get("/", async (req, res) => {
    const result = findFirst(dbConnection, "hit_count");
    res.json({ hitCount: result.count });
});

export { initHitCounter, hitCounter }