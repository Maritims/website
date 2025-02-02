import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { join, resolve } from "path";

const app = express();
const PORT = 3000;
const MICROSERVICE_TARGET = "http://localhost:8080"; // Change this if your API runs elsewhere
const DIRNAME = resolve('..');

// Serve static files
app.use(express.static(join(DIRNAME, "website", "build")));

// Proxy API requests
app.use("/microservice", createProxyMiddleware({
    target: MICROSERVICE_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/microservice": "/microservice" } // Adjust if needed
}));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Proxying API requests to ${MICROSERVICE_TARGET}`);
});