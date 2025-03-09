import express from 'express';
import cors from 'cors';
import { initHitCounter, hitCounter } from './routes/hit-counter.js';
import { initWeather, weather } from './routes/weather.js';

const app = express();
const { PORT = 8080, CORS_ORIGIN = 'http://localhost:3000' } = process.env;

app.use(express.json())
    .use(cors({ origin: CORS_ORIGIN, optionsSuccessStatus: 200 }))
    .use("/hit", hitCounter)
    .use("/weather", weather)
    .listen(PORT, async () => {
        console.log(`Listening on ${PORT}`);

        try {
            await initHitCounter();
        } catch (error) {
            console.error(`Failed to initialize hit counter: ${error}`);
            process.exit(1);
        }

        try {
            await initWeather();
        } catch (error) {
            console.error(`Failed to initialize weather: ${error}`);
            process.exit(1);
        }
    });