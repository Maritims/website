import fs from 'fs';
import path from 'path';

/**
 * Generates a robots.txt for the website.
 * @param siteUrl The URL of the website.
 * @returns {string} The robots.txt content.
 */
function generateRobots(siteUrl) {
    console.log('Generating robots.txt...');

    const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;
    
    return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

const sourceDir = process.env.SOURCE_DIR || 'build';
const siteUrl = process.env.SITE_URL || 'https://clueless.no/';
const robotsTxt = generateRobots(siteUrl);

fs.writeFileSync(path.join(sourceDir, 'robots.txt'), robotsTxt);
console.log('robots.txt written.');
