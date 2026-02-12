import fs from 'fs';
import path from 'path';
import {findHtmlFiles} from './utils.js';

function generateSitemapMarkup(sourceDir, siteUrl) {
    if(!sourceDir) {
        throw new Error("Source directory not specified.");
    }
    if(!siteUrl) {
        throw new Error("Site URL not specified.");
    }
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Directory ${sourceDir} does not exist.`);
    }

    if (siteUrl.endsWith('/')) {
        siteUrl = siteUrl.slice(0, -1);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${findHtmlFiles(sourceDir).map(file => `    <url>
        <loc>${siteUrl}/${file}</loc>
        <lastmod>${fs.statSync(path.join(sourceDir, file)).mtime.toISOString()}</lastmod>
    </url>`).join('\n')}
</urlset>`;
}

/**
 * Writes the specified sitemap markup to the specified output file.
 * @param sitemapMarkup The sitemap markup to write.
 * @param outputDir The path to the output file.
 */
function writeSitemap(sitemapMarkup, outputDir) {
    const outputFile = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(outputFile, sitemapMarkup);
}

export {generateSitemapMarkup, writeSitemap};