import fs from 'fs';
import path from 'path';

/**
 * Gets a list of all HTML files in the specified directory and all subdirectories.
 * @param dir The directory to search for HTML files.
 * @param fileList The list of HTML files found so far.
 * @returns {string[]} The list of HTML files in the specified directory and all subdirectories.
 */
function getHtmlFiles(dir, fileList = []) {
    console.log(`Searching ${dir} for HTML files...`);

    const htmlFiles = fs.readdirSync(dir);

    htmlFiles.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getHtmlFiles(filePath, fileList);
        } else if (filePath.endsWith('.html')) {
            fileList.push(filePath);
        }
    })

    return fileList;
}

/**
 * Builds a URL for a specific file.
 * @param filePath The path to the file relative to the root directory.
 * @param sourceDir The directory containing the HTML files.
 * @param siteUrl The URL of the website.
 * @returns {string} The URL for the file.
 */
function buildUrl(filePath, sourceDir, siteUrl) {
    console.log(`Building URL for ${filePath}`);

    let relativePath = path.relative(sourceDir, filePath);
    let cleanPath = relativePath.replace(/\\/g, '/').replace(/index\.html$/, '');
    
    if (!cleanPath.startsWith('/') && cleanPath !== '') {
        cleanPath = `/${cleanPath}`;
    }
    return `${siteUrl.replace(/\/$/, '')}${cleanPath}`;
}

/**
 * Generates a sitemap for the website.
 * @param sourceDir The directory containing the HTML files.
 * @param siteUrl The URL of the website.
 * @returns {string} The sitemap XML.
 */
function generateSitemap(sourceDir, siteUrl) {
    console.log('Generating sitemap...');

    const htmlFiles = getHtmlFiles(sourceDir);
    
    if (htmlFiles.length === 0) {
        throw new Error(`No HTML files found in ${sourceDir}.`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${htmlFiles.map(filePath => `    <url>
        <loc>${buildUrl(filePath, sourceDir, siteUrl)}</loc>
        <lastmod>${new Date(fs.statSync(filePath).mtimeMs).toISOString()}</lastmod>
    </url>`).join('\n')}   
</urlset>`;
}

const sourceDir = process.env.SOURCE_DIR || 'build';
const siteUrl = process.env.SITE_URL || 'https://clueless.no/';
const siteMapXml = generateSitemap(sourceDir, siteUrl);

fs.writeFileSync(path.join(sourceDir, 'sitemap.xml'), siteMapXml);
console.log('Sitemap written.');