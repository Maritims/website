import assert from "assert";
import fs from "fs";
import {findHtmlFiles, log} from "./utils.js";
import {JSDOM} from "jsdom";
import path from "path";

/**
 * @typedef {object} Assertion
 * @property {string} description The description of the assertion.
 * @property {() => boolean} fn The function to execute.
 */

/**
 * Asserts that the specified function does not throw an error. If an error is thrown, it is logged and the assertion fails.
 * @param description The description of the assertion.
 * @param fn The function to execute.
 * @return {boolean} Whether the assertion passed or failed.
 */
function assertSafely(description, fn) {
    if(!description) {
        throw new Error("description must be defined");
    }
    if(!fn) {
        throw new Error("fn must be defined");
    }
    try {
        fn();
        return true;
    } catch (error) {
        log.error(`\tFAILED: ${description}: ${error.message}`);
        return false;
    }
}

function verifyDocumentHead(sourcePath) {
    if (!sourcePath) {
        throw new Error("sourcePath must be defined");
    }
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`File ${sourcePath} not found.`);
    }

    log.info(`Verifying document head: ${sourcePath}`);

    const fileContent = fs.readFileSync(sourcePath, "utf-8");
    const dom = new JSDOM(fileContent);
    const {document} = dom.window;

    /**
     * The assertions to run.
     * @type {Assertion[]}
     */
    const assertions = [{
        description: "Document title must be present.",
        fn: () => assert.ok(document.title, "Document title not found.")
    }, {
        description: "Meta charset must be set to UTF-8",
        fn: () => assert.strictEqual(document.head.querySelector('meta[charset]')?.getAttribute('charset')?.toLowerCase(), 'utf-8')
    }, {
        description: "Meta description must be present.",
        fn: () => assert.ok(document.head.querySelector('meta[name="description"]')?.getAttribute('content'), 'Document meta description not found.')
    }, {
        description: "Meta viewport must be set to width=device-width, initial-scale=1.0",
        fn: () => assert.strictEqual(document.head.querySelector('meta[name="viewport"]')?.getAttribute('content'), 'width=device-width, initial-scale=1.0')
    }, {
        description: "Stylesheet must be present",
        fn: () => assert.ok(document.head.querySelector('link[rel="stylesheet"]')?.getAttribute('href'), 'Document stylesheet not found.')
    }, {
        description: "Webmention endpoint must be present",
        fn: () => assert.ok(document.head.querySelector('link[rel="webmention"]'), 'Document webmention not found.')
    }, {
        description: "Webmention endpoint must be set to /api/webmention",
        fn: () => assert.equal("/api/webmention", document.head.querySelector('link[rel="webmention"]')?.getAttribute('href'))
    }];

    const failures = assertions.map(assertion => assertSafely(assertion.description, assertion.fn)).filter(result => result === false).length;
    if (failures > 0) {
        log.error(`\t${failures} assertion(s) failed in ${sourcePath}`);
    }
}

function verifyFiles(sourceDir) {
    if (!sourceDir) {
        throw new Error("sourceDir must be defined");
    }
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Directory ${sourceDir} not found.`);
    }

    const htmlFiles = findHtmlFiles(sourceDir);
    htmlFiles.forEach(file => verifyDocumentHead(path.join(sourceDir, file)));
}

verifyFiles('../src');