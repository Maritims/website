import * as fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'path';
import sharp from 'sharp';
import {generateSitemap} from './generate-sitemap.js';
import {generateRobots} from "./generate-robots.js";

class ImageProcessor {
    /**
     *
     * @param {string} fileName
     */
    getTargetFileName(fileName) {
        if (fileName.endsWith(".svg")) {
            return fileName;
        } else {
            return `${path.parse(fileName).name}.webp`;
        }
    }

    /**
     * @param {string} directory
     * @param {string} fileName
     */
    async optimizeAndCopyFile(directory, fileName) {
        const sourceFilePath = path.join(directory, fileName);
        const targetFilePath = path.join(directory, this.getTargetFileName(fileName));
        const targetFileExists = existsSync(targetFilePath);

        if (targetFileExists) {
            const sourceFileLastModified = (await fs.stat(sourceFilePath)).mtimeMs;
            const targetFileLastModified = (await fs.stat(targetFilePath)).mtimeMs;

            if (targetFileLastModified > sourceFileLastModified) {
                console.log(`Skipping ${fileName}: Optimized version already exists.`);
                return;
            }
        }

        try {
            console.log(`Copying optimized version of ${sourceFilePath} to ${targetFilePath}`);
            await sharp(sourceFilePath)
                .toFormat('webp', {quality: 80})
                .toFile(targetFilePath);
        } catch (error) {
            console.error(`Failed to optimize and copy ${sourceFilePath} to ${targetFilePath}`, error);
        }
    }

    /**
     * Optimise all images in the source directory and copy them to the target directory.
     */
    async optimizeAndCopyFiles(dir) {
        const fileNames = await fs.readdir(dir);

        for (const fileName of fileNames) {
            if (!fileName.endsWith('.webp')) {
                await this.optimizeAndCopyFile(dir, fileName);
                await fs.rm(path.join(dir, fileName));
            }
        }
    }
}

async function build() {
    const now = new Date();

    const imageProcessor = new ImageProcessor();
    await imageProcessor.optimizeAndCopyFiles('src/images');

    const srcDir = './src';
    const siteUrl = process.env.SITE_URL || '';

    const siteMapXml = generateSitemap(srcDir, process.env.SITE_URL || 'https://clueless.no');
    await fs.writeFile(path.join(srcDir, 'sitemap.xml'), siteMapXml);
    console.log(`Sitemap written to ${srcDir}.`);

    const robotsTxt = generateRobots(siteUrl);
    await fs.writeFile(path.join(srcDir, 'robots.txt'), robotsTxt);
    console.log(`robots.txt written to ${srcDir}.`);

    const elapsed = new Date().getTime() - now;
    console.log(`Build complete in ${elapsed / 1000} s`);
}

build().then(() => {
});
