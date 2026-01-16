import { formatInTimeZone } from 'date-fns-tz';
import ejs from 'ejs';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'path';
import sharp from 'sharp';

/**
 * @typedef {object} Page
 * @property {string} title
 * @property {string} description
 * @property {string} name
 */

class ImageProcessor {
    /**
     * 
     * @param {string} fileName 
     */
    getTargetFileName(fileName) {
        if(fileName.endsWith(".svg")) {
            return fileName;
        } else {
            return `${path.parse(fileName).name}.webp`;
        }
    }

    /**
     * Optimize the image in the source directory and copy it to the target directory.
     * @param {string} sourceDirectory
     * @param {string} targetDirectory
     * @param {string} fileName
     */
    async optimizeAndCopyFile(sourceDirectory, targetDirectory, fileName) {
        const sourceFilePath = path.join(sourceDirectory, fileName);
        const targetFilePath = path.join(targetDirectory, this.getTargetFileName(fileName));
        const targetFileExists = existsSync(targetFilePath);

        if(targetFileExists) {
            const sourceFileLastModified = (await fs.stat(sourceFilePath)).mtimeMs;
            const targetFileLastModified = (await fs.stat(targetFilePath)).mtimeMs;

            if(targetFileLastModified > sourceFileLastModified) {
                console.log(`Skipping ${sourceFilePath}`);
                return;
            }
        }

        try {
            console.log(`Copying optimized version of ${sourceFilePath} to ${targetFilePath}`);
            await sharp(sourceFilePath)
                .toFormat('webp', { quality: 80 })
                .toFile(targetFilePath);
        } catch (error) {
            console.error(`Failed to optimize and copy ${sourceFilePath} to ${targetFilePath}`, error);
        }
    }

    /**
     * Optimize all images in the source directory and copy them to the target directory.
     */
    async optimizeAndCopyFiles(sourceDirectory, targetDirectory) {
        if(!existsSync(targetDirectory)) {
            await fs.mkdir(targetDirectory);
        }
        const fileNames = await fs.readdir(sourceDirectory);

        for (const fileName of fileNames) {
            const stats = await fs.stat(path.join(sourceDirectory, fileName));
            if(stats.isDirectory()) {
                sourceDirectory = path.join(sourceDirectory, fileName);
                targetDirectory = path.join(targetDirectory, fileName);
                await this.optimizeAndCopyFiles(sourceDirectory, targetDirectory);
            } else {
                await this.optimizeAndCopyFile(sourceDirectory, targetDirectory, fileName);
            }
        }
    }
}

class PageProcessor {
    /**
     * @type {string}
     */
    templateHtml;
    /**
     * @type {number}
     */
    templateFileLastModified;
    /**
     * @type {string}
     */
    htmlSourceDirectory;
    /**
     * @type {string}
     */
    htmlTargetDirectory;
    /**
     * @type {string}
     */
    scriptSourceDirectory;

    /**
     * @param {string} templateHtml The template HTML to use when rendering a page.
     * @param {number} templateFileLastModified When the template file was last modified. Used to determine whether to actually render a page.
     * @param {string} htmlSourceDirectory The directory containing the page files.
     * @param {string} htmlTargetDirectory The directory to put the rendered pages into.
     * @param {string} scriptSourceDirectory The directory to check for script files belonging to page files.
     */
    constructor(templateHtml, templateFileLastModified, htmlSourceDirectory, htmlTargetDirectory, scriptSourceDirectory) {
        if (!templateHtml) throw Error('templateHtml is required');
        if (!templateFileLastModified) throw Error('templateFileLastModified is required');
        if (!htmlSourceDirectory) throw Error('htmlSourceDirectory is required');
        if (!htmlTargetDirectory) throw Error('htmlTargetDirectory is required');
        if (!scriptSourceDirectory) throw Error('scriptSourceDirectory is required');

        this.templateHtml = templateHtml;
        this.templateFileLastModified = templateFileLastModified;
        this.htmlSourceDirectory = htmlSourceDirectory;
        this.htmlTargetDirectory = htmlTargetDirectory;
        this.scriptSourceDirectory = scriptSourceDirectory;
    }

    /**
     * Build a specific page if the template is newer than the template file, or if the source page file is newer than the target page file.
     * @param {Page} page 
     */
    async renderAndCopyFile(page) {
        // Should we build the page?
        // We should build it if the template is newer than the page.

        const sourceHtmlFilePath = path.join(this.htmlSourceDirectory, `${page.name}.html`);
        const targetHtmlFilePath = path.join(this.htmlTargetDirectory, `${page.name}.html`);
        const targetHtmlFileExists = existsSync(targetHtmlFilePath);

        if (targetHtmlFileExists) {
            const sourceFileLastModified = await fs.stat(sourceHtmlFilePath);
            const targetFileLastModified = await fs.stat(targetHtmlFilePath);

            if (targetFileLastModified.mtimeMs >= sourceFileLastModified.mtimeMs && targetFileLastModified.mtimeMs >= this.templateFileLastModified) {
                console.log(`Skipping ${sourceHtmlFilePath}`);
                return;
            }
        }

        console.log(`Building ${sourceHtmlFilePath}`);

        const rawHtml = await fs.readFile(sourceHtmlFilePath);
        const renderOptions = {
            ...page,
            htmlContent: rawHtml,
            scripts: [],
            lastUpdated: formatInTimeZone(new Date(), 'Europe/Oslo', 'yyyy-MM-dd HH:mm:ss zzz')
        };

        const scriptFilePath = path.join(this.scriptSourceDirectory, `${page.name}.js`);
        const hasScriptFile = existsSync(scriptFilePath);
        if (hasScriptFile) {
            renderOptions.scripts.push(`${page.name}.js`);
        }
        const renderedHtml = ejs.render(this.templateHtml, renderOptions);

        await fs.writeFile(targetHtmlFilePath, renderedHtml);

    }

    /**
    * Build the specific pages.
    * @param {Page[]} pages 
    */
    async renderAndCopyFiles(pages) {
        for (const page of pages) {
            await this.renderAndCopyFile(page);
        }
    }
}

class StaticFileProcessor {
    /**
     * @type {string}
     */
    sourceDirectory;
    /**
     * @type {string}
     */
    targetDirectory;

    /**
     * @param {string} sourceDirectory 
     * @param {string} targetDirectory 
     */
    constructor(sourceDirectory, targetDirectory) {
        this.sourceDirectory = sourceDirectory;
        this.targetDirectory = targetDirectory;
    }

    /**
     * Copy the file to the target directory.
     * @param {string} fileName 
     */
    async copyFile(fileName) {
        const sourceFilePath = path.join(this.sourceDirectory, fileName);
        const targetFilePath = path.join(this.targetDirectory, fileName);
        const sourceFileStats = await fs.stat(sourceFilePath);

        if (sourceFileStats.isDirectory()) {
            if (fileName === 'images') {
                const imageProcessor = new ImageProcessor();
                await imageProcessor.optimizeAndCopyFiles(sourceFilePath, targetFilePath);
            } else {
                await fs.cp(sourceFilePath, targetFilePath, {
                    recursive: true
                });
            }
        } else {
            const targetFileExists = existsSync(targetFilePath);

            if(targetFileExists) {
                const sourceFileLastModified = (await fs.stat(sourceFilePath)).mtimeMs;
                const targetFileLastModified = (await fs.stat(targetFilePath)).mtimeMs;

                if (targetFileLastModified >= sourceFileLastModified) {
                    console.log(`Skipping ${sourceFilePath}`);
                    return;
                }
            }

            console.log(`Copying ${sourceFilePath} to ${targetFilePath}`);
            await fs.copyFile(sourceFilePath, targetFilePath);
        }
    }

    /**
     * Copy all files in the source directory to the target directory.
     */
    async copyFiles() {
        /**
         * @type {string[]}
         */
        const fileNames = await fs.readdir(this.sourceDirectory);

        for (const fileName of fileNames) {
            await this.copyFile(fileName);
        }
    }
}

async function buildEverything() {
    const now = new Date();
    const buildDir = 'build';
    const srcDir = 'src';
    const staticDir = 'static';

    /**
     * @type {Page[]}
     */
    const pages = [{
        title: 'Martin Severin Steffensen',
        description: 'My personal website.',
        name: 'index'
    }, {
        title: 'EVE Online: Ninja Hacking Guide',
        description: 'A comprehensive guide to ninja hacking data and relic sites in C5 wormholes using a Myrmidon. Includes fit, tactics, and site-specific strategies.',
        name: 'eve-online-ninja-hacking-guide'
    }, {
        title: 'Gallery',
        description: 'This used to be my Instagram feed.',
        name: 'gallery'
    }, {
        title: 'CV',
        description: 'My CV.',
        name: 'cv'
    }, {
        title: 'Projects',
        description: 'Some of my projects.',
        name: 'projects'
    }, {
        title: 'Links',
        description: 'Links to other areas of the Internet I enjoy.',
        name: 'links'
    }];

    const templateHtml = await fs.readFile(`${srcDir}/layout.html`, 'utf-8');
    const templateFileLastModified = (await fs.stat(`${srcDir}/layout.html`)).mtimeMs;

    const pageProcessor = new PageProcessor(templateHtml, templateFileLastModified, srcDir, buildDir, staticDir);
    await pageProcessor.renderAndCopyFiles(pages);

    const staticFileProcessor = new StaticFileProcessor(staticDir, buildDir);
    await staticFileProcessor.copyFiles();

    const elapsed = new Date().getTime() - now;
    console.log(`Build complete in ${elapsed / 1000} s`);
}

buildEverything().then(() => {});
