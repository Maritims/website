import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import util from 'util';
import stream from 'stream';

const { SPACE_NAME, SPACE_REGION, SPACE_ACCESS_KEY_ID, SPACE_SECRET_ACCESS_KEY } = process.env;
if(!SPACE_NAME || !SPACE_REGION || !SPACE_ACCESS_KEY_ID || !SPACE_SECRET_ACCESS_KEY) {
    throw new Error("Missing one or more environment variable. S3 client creation would fail.");
}

const endpoint = `https://${SPACE_REGION}.digitaloceanspaces.com`;


const s3 = new S3Client({
    SPACE_REGION,
    endpoint,
    credentials: {
        SPACE_ACCESS_KEY_ID,
        SPACE_SECRET_ACCESS_KEY
    }
});

async function fileExists(filename) {
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
        console.error(`Unable to upload ${filename}: S3 client is undefined`);
        return;
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
        console.error(`Unable to download ${filename}: S3 client is undefined`);
        return;
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