import express from 'express';
import {createProxyMiddleware} from "http-proxy-middleware";
import {log} from './utils.js';

const app = express();

const webmentionProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {'^/' : '/webmention'},
    on: {
        proxyReq: (proxyReq, req, res) => {
            const fullHost = proxyReq.getHeader('host');
            console.log(`[Proxying] ${req.method} ${req.url} -> ${fullHost}${proxyReq.path}`);
        }
    }
});

app.use('/api/webmention', webmentionProxy);
app.use(express.static('website/src'));

app.listen(3000, () => {
    log.info('Server listening on port 3000');
});