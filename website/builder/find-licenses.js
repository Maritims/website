import fs from 'fs';
import {log} from './utils.js';
import path from 'path';

/**
 * @typedef {object} PackageLicenseType
 * @property {string} name The name of the package.
 * @property {string} SPDX The SPDX identifier for the license, e.g. MIT, Apache-2.0 etc.
 */

/**
 * @typedef {object} PackageLicense
 * @property {string} name The name of the package.
 * @property {string} SPDX The SPDX identifier for the license, e.g. MIT, Apache-2.0 etc.
 * @property {string|undefined} license The content of the license file.
 */

/**
 * Finds license types for the specified packages in the specified lock file.
 * @param {string} lockFilePath The path to the lock file.
 * @param {string[]} shippedPackages The packages to find licenses for.
 * @returns {PackageLicenseType[]}
 */
export function findPackageLicenseTypes(lockFilePath, shippedPackages = []) {
    if (!lockFilePath) {
        throw new Error("Lock file path not specified.");
    }
    if (!fs.existsSync(lockFilePath)) {
        throw new Error(`Lock file ${lockFilePath} does not exist.`);
    }

    const lockFile = JSON.parse(fs.readFileSync(lockFilePath, 'utf-8'));

    return Object.entries(lockFile.packages)
        .filter(([name]) => {
            const nameParts = name.split('/');
            return shippedPackages.includes(nameParts[nameParts.length - 1]);
        })
        .map(([packagePath, details]) => {
            const nameParts = packagePath.split('/');
            return {
                name: nameParts[nameParts.length - 1],
                SPDX: details.license
            };
        });
}

/**
 * @param {PackageLicenseType[]} packageLicenseTypes
 * @param {string[]} licenseFileNames
 * @returns {PackageLicense[]}
 */
export function findPackageLicenses(packageLicenseTypes, licenseFileNames = ['license', 'license.md', 'license.txt']) {
    if (!packageLicenseTypes || !packageLicenseTypes.length) {
        throw new Error("packageLicenseTypes must be defined and cannot be empty");
    }

    return packageLicenseTypes.map(({name, SPDX}) => {
        const packageDir = path.join('node_modules', name);
        const licenseFile = fs.readdirSync(packageDir).find(file => licenseFileNames.includes(file.toLowerCase()));
        return {
            name,
            SPDX,
            licenseContent: licenseFile ? fs.readFileSync(path.join(packageDir, licenseFile), 'utf-8') : undefined
        }
    });
}

export function createLicenseFiles(packageLicenses, outputDir) {
    if(!packageLicenses || !packageLicenses.length) {
        throw new Error("packageLicenses must be defined and cannot be empty");
    }
    if(!outputDir) {
        throw new Error("outputDir must be defined");
    }
    if(!fs.existsSync(outputDir)) {
        throw new Error(`Output directory ${outputDir} does not exist.`);
    }

    packageLicenses.forEach(({name, SPDX, licenseContent}) => {
        const licenseFilePath = path.join(outputDir, `${name}.txt`);
        log.info(`Writing license file for ${name} to ${licenseFilePath}`);
        fs.writeFileSync(licenseFilePath, licenseContent || SPDX);
    });
}

const packageLicenseTypes = findPackageLicenseTypes('package-lock.json', ['express', 'jsdom', 'sharp', 'winston']);
const packageLicenses = findPackageLicenses(packageLicenseTypes);

const outputDir = process.env.OUTPUT_DIR || '../src/lisenser';
createLicenseFiles(packageLicenses, outputDir);