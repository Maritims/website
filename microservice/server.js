import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import hitCouter from './routes/hitCounter.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors({
    origin: 'https://clueless.no',
    optionsSuccessStatus: 200
}));

app.use("/hit", hitCouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})