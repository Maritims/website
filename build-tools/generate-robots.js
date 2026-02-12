import fs from 'fs';

/**
 * Generates a robots.txt file for the specified site URL.
 * @param siteUrl
 * @param outputFile
 */
export function generateRobots(siteUrl, outputFile) {
    fs.writeFileSync(outputFile, `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
}