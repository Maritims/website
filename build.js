import { formatInTimeZone } from 'date-fns-tz';
import ejs, { render } from 'ejs';
import fs from 'fs';

const now = new Date();
const buildDir = 'build';
const srcDir = 'src';
const staticDir = 'static';
const buildDateTime = formatInTimeZone(new Date(), 'Europe/Oslo', 'yyyy-MM-dd HH:mm:ss zzz');

/**
 * @typedef {object} Page
 * @property {string} title
 * @property {string} description
 * @property {string} name
 */

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
}];

const templateHtml = fs.readFileSync(`${srcDir}/layout.html`, 'utf-8');
const templateFileLastModified = fs.statSync(`${srcDir}/layout.html`).mtimeMs;

pages.forEach(page => {
    // Should we build the page?
    // We should build it if the template is newer than the page.

    const sourceHtmlFile = `${srcDir}/${page.name}.html`;
    const targetHtmlFile = `${buildDir}/${page.name}.html`;
    if(fs.existsSync(targetHtmlFile)) {
        const sourceFileLastModified = fs.statSync(sourceHtmlFile).mtimeMs;
        const targetFileLastModified = fs.statSync(targetHtmlFile).mtimeMs;
        if(targetFileLastModified > sourceFileLastModified && targetFileLastModified > templateFileLastModified) {
            console.log(`Skipping ${page.name}`);
            return;
        }
    }

    console.log(`Building ${page.name}`);

    const rawHtml = fs.readFileSync(`${srcDir}/${page.name}.html`);
    const renderOptions = {
        ...page,
        htmlContent: rawHtml,
        scripts: [],
        lastUpdated: buildDateTime
    };

    const hasScriptFile = fs.existsSync(`${staticDir}/${page.name}.js`)
    if(hasScriptFile) {
        renderOptions.scripts.push(`${page.name}.js`);
    }
    const renderedHtml = ejs.render(templateHtml, renderOptions);

    fs.writeFileSync(`${buildDir}/${page.name}.html`, renderedHtml);
});

/**
 * @type {string[]}
 */
const staticFiles = fs.readdirSync(staticDir);

staticFiles.forEach(staticFile => {
    const sourcePath = `${staticDir}/${staticFile}`;
    const sourceStats = fs.statSync(sourcePath);
    const targetPath = `${buildDir}/${staticFile}`

    console.log(`Copying ${sourcePath} to ${targetPath}`);
    
    if(sourceStats.isDirectory()) {
        fs.cpSync(sourcePath, targetPath, {
            recursive: true
        });
    } else {
        fs.copyFileSync(`${sourcePath}`, `${targetPath}`);
    }
});

const elapsed = new Date().getTime() - now;
console.log(`Build complete in ${elapsed / 1000} s`);
