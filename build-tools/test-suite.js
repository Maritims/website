import assert from 'assert';
import {findHtmlFiles, log} from './utils.js';
import {generateSitemapMarkup} from './generate-sitemap.js';

/**
 * @typedef {object} TestCase
 * @property {string} name The name of the test case.
 * @property {() => void} test The test function.
 */

/**
 * @typedef {object} TestSuite
 * @property {string} name The name of the test suite.
 * @property {TestCase[]} testCases The test cases in the test suite.
 */

/**
 * The test suites to run.
 * @type {TestSuite[]}
 */
const testSuites = [{
    name: 'findHtmlFiles',
    testCases: [{
        name: 'Only HTML files should be found',
        test: () => {
            const files = findHtmlFiles();
            const undesiredFilesFound = files.filter(file => !file.endsWith(".html"));
            assert.ok(undesiredFilesFound.length === 0, `${undesiredFilesFound.length} undesirable files were found`);
        }
    }],
}, {
    name: 'generateSitemapMarkup',
    testCases: [{
        name: 'The markup generation should succeed',
        test: () => {
            const result = generateSitemapMarkup('../src', 'https://clueless.no/');
            assert.ok(result.includes('<url>'), 'The generated markup does not contain any <url> elements');
        }
    }]
}];

log.info('Running test suites...');

testSuites.forEach(testSuite => {
    log.info(`Running test suite: ${testSuite.name}`);

    testSuite.testCases.forEach(testCase => {
        let passed = false;
        let errorMessage = '';

        try {
            testCase.test();
            passed = true;
        } catch (error) {
            errorMessage = error.message;
        }

        log.info(`\t${passed ? 'PASSED' : 'FAILED'}: ${testCase.name}${errorMessage ? ` (message: "${errorMessage}")` : ''}`);
    });
});