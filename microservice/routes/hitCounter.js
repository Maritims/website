import express from 'express';
import postgres from 'postgres';

const connectionString = process.env.CONNECTION_STRING;
const sql = postgres(connectionString);

(async function () {
    await sql`CREATE TABLE IF NOT exists hit_count (id SERIAL PRIMARY KEY, count INTEGER NOT NULL)`;
    const result = await sql`SELECT count FROM hit_count ORDER BY id DESC LIMIT 1`;

    if(result.count === 0) {
        await sql`INSERT INTO hit_count (count) VALUES(0)`;
    }
})();

const router = express.Router();
router.post("/", async (req, res) => {
    await sql`UPDATE hit_count SET count = count + 1`;
    const result = await sql`SELECT count FROM hit_count ORDER BY id DESC LIMIT 1`;
    res.json({ hitCount: result[0].count });
});

router.get("/", async (req, res) => {
    const result = await sql`SELECT count FROM hit_count ORDER BY id DESC LIMIT 1`;
    res.json({ hitCount: result[0].count });
});

export default router;