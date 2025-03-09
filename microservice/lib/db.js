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
        let dbFileExists = false;

        try {
            dbFileExists = await fileExists(filename);
            if (dbFileExists) {
                await downloadFile(filename);
                console.log(`Downloaded ${filename}`);
            }
        } catch (error) {
            reject(`Unable to verify existence of, and download ${filename}. Connection to database cannot be established: ${error}`);
            return;
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
        if (!dbConnection) {
            reject("Unable to execute query: No database connection");
            return;
        }

        dbConnection.run(query, params, async function (error) {
            if (error) {
                reject(error);
                return;
            }

            await uploadFile(dbConnection.filename);
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
        if (!dbConnection) {
            reject("Not connected to database.");
            return;
        }

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

function findLast(dbConnection, table) {
    return new Promise((resolve, reject) => {
        if (!dbConnection) {
            reject(`Unable to query table ${table}: Not connected to database.`);
            return;
        }
    
        dbConnection.get(
            `SELECT * FROM ${table}`,
            (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            }
        )
    });
}

export {
    createConnection,
    run,
    findFirst,
    findLast
}