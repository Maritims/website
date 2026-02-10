import fs from 'fs';
import winston from 'winston';

const log = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        // 2. Define the output structure
        winston.format.printf(({timestamp, level, message}) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'build.log'})
    ]
});

/**
 * Finds all HTML files in the specified directory.
 * @param {string} sourceDir The directory to search in. Defaults to '../src'.
 * @returns {string[]} The paths to the found HTML files.
 * @throws {Error} If the specified directory does not exist.
 */
function findHtmlFiles(sourceDir = '../src') {
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Directory ${sourceDir} does not exist.`);
    }

    return [...fs.readdirSync(sourceDir, {
        recursive: true
    })].filter(file => file.endsWith('.html'));
}

export {findHtmlFiles, log};