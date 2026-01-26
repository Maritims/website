/**
 * Generates a robots.txt for the website.
 * @param siteUrl The URL of the website.
 * @returns {string} The robots.txt content.
 */
export function generateRobots(siteUrl) {
    console.log('Generating robots.txt...');

    const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;
    
    return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}