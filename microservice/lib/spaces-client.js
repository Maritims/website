import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import util from 'util';
import stream from 'stream';

const { SPACE_NAME, SPACE_REGION, SPACE_ACCESS_KEY_ID, SPACE_SECRET_ACCESS_KEY } = process.env;
const endpoint = `https://${SPACE_REGION}.digitaloceanspaces.com`;

/**
 * @type {S3Client|undefined}
 */
let s3;
if(SPACE_REGION && SPACE_ACCESS_KEY_ID && SPACE_SECRET_ACCESS_KEY) {
    s3 = new S3Client({
        forcePathStyle: false,
        region: SPACE_REGION,
        endpoint: endpoint,
        credentials: {
            accessKeyId: SPACE_ACCESS_KEY_ID,
            secretAccessKey: SPACE_SECRET_ACCESS_KEY
        }
    });
} else {
    console.error(`Unable to create S3Client. One or more environment variables is missing.`);
}

async function fileExists(filename) {
    if(!s3) {
        throw new Error("S3 client is not initialized.");
    }

    const command = new HeadObjectCommand({
        Bucket: SPACE_NAME,
        Key: filename
    });

    try {
        await s3.send(command);
        return true;
    } catch (error) {
        if (error.name === 'NotFound') {
            return false;
        } else {
            throw error;
        }
    }
}

async function uploadFile(filename) {
    if(!s3) {
        throw new Error("S3 client is not initialized.");
    }

    const fileData = await readFile(filename);
    const command = new PutObjectCommand({
        Bucket: SPACE_NAME,
        Key: filename,
        Body: fileData,
        ACL: "private",
        ContentType: "application/x-sqlite3"
    });

    await s3.send(command);
}

async function downloadFile(filename) {
    if(!s3) {
        throw new Error("S3 client is not initialized.");
    }

    try {
        const command = new GetObjectCommand({
            Bucket: SPACE_NAME,
            Key: filename
        });

        const { Body } = await s3.send(command);

        const writableStream = fs.createWriteStream(filename);
        const readableStream = Body;

        const pipeline = util.promisify(stream.pipeline);
        await pipeline(readableStream, writableStream);
    } catch (error) {
        console.error(error);
    }
}

export {
    fileExists,
    uploadFile,
    downloadFile
}