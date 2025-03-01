import express from 'express';
import cors from 'cors';
import { createConnection, run, findFirst } from './lib/db.js';

/**
 * @type {sqlite3.Database|undefined}
 */
let dbConnection;

const app = express();
const { PORT = 8080, CORS_ORIGIN = 'http://localhost:3000' } = process.env;

app.use(express.json())
    .use(cors({ origin: CORS_ORIGIN, optionsSuccessStatus: 200 }))
    .use("/hit", express.Router()
        .post("/", async (req, res) => {
            await run(dbConnection, `UPDATE hit_count SET count = count + 1, lastUpdated = ?`, [new Date().toISOString()]);
            
            const result = await findFirst(dbConnection, "hit_count");
            res.json({ hitCount: result.count });
        })
        .get("/", async (req, res) => {
            const result = await findFirst(dbConnection, "hit_count");
            res.json({ hitCount: result.count });
        }))
    .listen(PORT, async () => {
        console.log(`Listening on ${PORT}`);

        dbConnection = await createConnection('hitCounter.db');
        console.log(`Connected to database`);

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

        dbConnection = dbConnection;
    });