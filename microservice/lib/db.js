import sqlite3 from 'sqlite3';
import { fileExists, downloadFile, uploadFile } from './spaces-client.js';

/**
 * @type {number}
 */
let writes = 0;
/**
 * @type {Date}
 */
let lastWrite;

/**
 * Create a database if it doesn't exist and establish a connection to it.
 * 
 * Attempts to retrieve the database file from an S3 compatible storage service.
 * Uploads the database file upon creation if it's not found in the storage service.
 * 
 * @param {string} filename 
 * @returns {Promise<sqlite3.Database>}
 */
function createConnection(filename) {
    return new Promise(async (resolve, reject) => {
        const dbFileExists = await fileExists(filename);
        if (dbFileExists) {
            await downloadFile(filename);
            console.log(`Downloaded ${filename}`);
        }

        const db = new sqlite3.Database(filename, async (error) => {
            if (error) {
                reject(error);
                return;
            }

            if (!dbFileExists) {
                await uploadFile(filename);
            }

            resolve(db);
        });
    });
}

/**
 * Run a SQL query.
 * @param {sqlite3.Database} dbConnection 
 * @param {string} query
 * @param {Array} [params=[]]
 */
function run(dbConnection, query, params = []) {
    return new Promise(async (resolve, reject) => {
        dbConnection.run(query, params, async function (error) {
            if (error) {
                reject(error);
                return;
            }

            writes++;

            if (writes > 0 && (!lastWrite || (new Date() - lastWrite) > 1000 * 60 * 5)) {
                console.log(`Uploading database file - writes: ${writes}, lastWrite: ${lastWrite?.toISOString() || ''}`);
                await uploadFile(dbConnection.filename);
                lastWrite = new Date();
                writes = 0;
            }

            resolve(this);
        });
    });
}

/**
 * 
 * @param {string} dbConnection 
 * @param {string} table 
 * @returns {Promise<any>}
 */
function findFirst(dbConnection, table) {
    return new Promise((resolve, reject) => {
        dbConnection.get(
            `SELECT * FROM ${table} LIMIT 1`,
            (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            }
        );
    });
}

export {
    createConnection,
    run,
    findFirst
}