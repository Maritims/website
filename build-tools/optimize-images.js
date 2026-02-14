import fs from 'fs';
import {log} from './utils.js';
import path from 'path';
import sharp from 'sharp';

/**
 * Optimize the specified image.
 * @param {string} sourceFilePath The path to the image to optimize.
 * @returns {void}
 */
export function optimizeImage(sourceFilePath) {
    if (!sourceFilePath) {
        throw new Error("sourcePath must be defined");
    }
    if (!fs.existsSync(sourceFilePath)) {
        throw new Error(`File ${sourceFilePath} not found.`);
    }

    const fileName = path.basename(sourceFilePath);
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const targetDir = path.dirname(sourceFilePath);
    const targetPath = path.join(targetDir, `${baseName}.webp`);

    if (fs.existsSync(targetPath) && fs.statSync(sourceFilePath).mtimeMs <= fs.statSync(targetPath).mtimeMs) {
        log.info(`Skipping ${fileName}: Up to date.`);
        return;
    }

    log.info(`Converting: ${fileName} -> ${baseName}.webp`);
    sharp(sourceFilePath).webp()
        .toFile(targetPath)
        .then(() => fs.rmSync(sourceFilePath))
        .catch(error => log.error(`FAILED: Could not process ${sourceFilePath}: ${error.message}`));
}

/**
 * Optimize all images in the specified directory.
 * @param {string} targetDir The directory to optimize images in. Defaults to '../src/images'.
 * @param {string[]} supportedFormats The image formats to optimize. Defaults to ['jpg', 'jpeg', 'png', 'webp'].
 * @returns {void}
 * @throws {Error} If the specified directory does not exist.
 */
export function optimizeImages(targetDir = 'website/src/images', supportedFormats = ['jpg', 'jpeg', 'png', 'webp']) {
    if (!targetDir) {
        throw new Error("Target directory not specified.");
    }
    if (fs.existsSync(targetDir) === false) {
        throw new Error(`Directory ${targetDir} not found.`);
    }

    const images = fs.readdirSync(targetDir).filter(file => supportedFormats.includes(file.split('.').pop()));
    if (images.length === 0) {
        log.info(`No images found in ${targetDir}. Skipping optimization.`);
        return;
    }

    images.forEach(file => {
        const sourcePath = path.join(targetDir, file);
        optimizeImage(sourcePath);
    });
}