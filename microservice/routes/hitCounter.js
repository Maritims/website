import express from 'express';
import db from '../db.js';

const router = express.Router();
router.get("/", (req, res) => {
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
        });
    });
});

export default router;