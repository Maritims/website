import {generateSitemapMarkup, writeSitemap} from "./generate-sitemap.js";
import {log} from "./utils.js";
import {optimizeImages} from "./optimize-images.js";
import {generateRobots} from "./generate-robots.js";

/**
 * An enumeration of the build actions.
 * @type {Readonly<{OPTIMIZE_IMAGES: string, GENERATE_ROBOTS: string, GENERATE_SITEMAP: string}>}
 */
const BuildAction = Object.freeze({
    OPTIMIZE_IMAGES: 'optimize-images',
    GENERATE_ROBOTS: 'generate-robots',
    GENERATE_SITEMAP: 'generate-sitemap'
});

/**
 * @typedef {object} BuildOptions
 * @property {string} sourceDir
 * @property {string} outputDir
 * @property {string} siteUrl
 * @property {BuildAction[]} actions
 */

/**
 * Resolves the build options from the environment variables.
 * @returns {BuildOptions}
 */
function resolveOptions() {
    return {
        sourceDir: process.env.SOURCE_DIR || '../src',
        outputDir: process.env.OUTPUT_DIR || '../src',
        siteUrl: process.env.SITE_URL || 'https://clueless.no',
        actions: process.env
            .ACTIONS
            ?.split(',')
            ?.map(action => BuildAction[action]) || []
    }
}

function build() {
    const options = resolveOptions();
    if (!options.actions.length) {
        log.warn('No build actions specified. Skipping build.');
    }

    options.actions.forEach(action => {
        switch (action) {
            case BuildAction.GENERATE_ROBOTS:
                log.info(`Generating robots.txt for ${options.siteUrl}...`);
                generateRobots(options.siteUrl, options.outputDir + '/robots.txt');
                break;
            case BuildAction.GENERATE_SITEMAP:
                log.info(`Generating sitemap.xml for ${options.siteUrl}...`);
                const sitemapMarkup = generateSitemapMarkup(options.sourceDir, options.siteUrl);
                writeSitemap(sitemapMarkup, options.outputDir);
                break;
            case BuildAction.OPTIMIZE_IMAGES:
                log.info(`Optimizing images in ${options.sourceDir}...`);
                optimizeImages(options.sourceDir);
                break;
            default:
                log.warn(`Unknown build action: ${action}. Skipping.`);
        }
    })
}

build();