import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import ejs from 'ejs';
import fs from 'fs';

const buildDir = 'build';
const srcDir = 'src';
const staticDir = 'static';
const buildDateTime = formatInTimeZone(new Date(), 'Europe/Oslo', 'yyyy-MM-dd HH:mm:ss zzz');

/**
 * @typedef {object} Page
 * @property {string} title
 * @property {string} description
 * @property {string} filename
 */


/**
 * @type {Page[]}
 */
const pages = [{
    title: 'Martin Severin Steffensen',
    description: 'My personal website.',
    filename: 'index.html'
}, {
    title: 'EVE Online: Ninja Hacking Guide',
    description: 'A comprehensive guide to ninja hacking data and relic sites in C5 wormholes using a Myrmidon. Includes fit, tactics, and site-specific strategies.',
    filename: 'eve-online-ninja-hacking-guide.html'
}];

/**
 * @type {string}
 */
const template = fs.readFileSync(`${srcDir}/layout.html`, 'utf-8');

pages.forEach(page => {
    console.log(`Building ${page.filename}`);

    const rawHtml = fs.readFileSync(`${srcDir}/${page.filename}`);
    const renderedHtml = ejs.render(template, {
        ...page,
        htmlContent: rawHtml,
        lastUpdated: buildDateTime
    });

    fs.writeFileSync(`${buildDir}/${page.filename}`, renderedHtml);
});

/**
 * @type {string[]}
 */
const staticFiles = fs.readdirSync(staticDir);

staticFiles.forEach(staticFile => {
    fs.copyFileSync(`${staticDir}/${staticFile}`, `${buildDir}/${staticFile}`);
});


console.log(`Build complete`);
