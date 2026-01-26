/**
 * Virtual file system for the terminal.
 * @typedef {Object} VFSNode
 * @property {string|null} path - The absolute URL path (null for directories).
 * @property {string} name - The display name of the file or folder.
 * @property {'file' | 'dir'} type - The type of the node.
 * @property {VFSNode|null} parent - Reference to the parent node (null for root).
 * @property {Object<string, VFSNode>|null} children - Map of child nodes (null for files).
 */

(async function () {
    /**
     * Builds a virtual file system from a list of URLs.
     * @param {string[]} urls
     */
    function buildVirtualFileSystem(urls) {
        /**
         * @type {VFSNode}
         */
        const vfs = {
            path: "/",
            name: "~",
            type: "dir",
            parent: null,
            children: {}
        };

        urls.forEach(url => {
            const urlObj = new URL(url);
            const segments = urlObj.pathname.split('/').filter(segment => segment !== '');

            let current = vfs;

            segments.forEach((segment, index) => {
                const isLast = index === segments.length - 1;

                if (!current.children[segment]) {
                    current.children[segment] = {
                        path: current.path === "/" ? `/${segment}` : `${current.path}/${segment}`,
                        name: segment,
                        type: isLast ? "file" : "dir",
                        parent: current,
                        children: isLast ? null : {}
                    }
                }

                if(!isLast) {
                    current = current.children[segment];
                }
            })
        });

        return vfs;
    }

    /**
     * Resolves a path to a VFS node.
     * @param {string} path - The path to resolve (relative or absolute).
     * @param {VFSNode} base - The base directory for relative paths.
     * @returns {VFSNode|null} - The resolved node or null if not found.
     */
    function resolvePath(path, base) {
        if (!path || path === '.') {
            return base;
        }

        if (path === '~' || path === '/') {
            return buildVirtualFileSystem(sitemapUrls);
        }

        if (path === '..') {
            return base.parent || base;
        }

        // Handle absolute paths
        if (path.startsWith('/') || path.startsWith('~')) {
            let current = buildVirtualFileSystem(sitemapUrls);
            const segments = path.replace(/^[~\/]+/, '').split('/').filter(s => s !== '');

            for (const segment of segments) {
                if (segment === '..') {
                    current = current.parent || current;
                } else if (segment !== '.') {
                    if (!current.children || !current.children[segment]) {
                        return null;
                    }
                    current = current.children[segment];
                }
            }
            return current;
        }

        // Handle relative paths
        const segments = path.split('/').filter(s => s !== '');
        let current = base;

        for (const segment of segments) {
            if (segment === '..') {
                current = current.parent || current;
            } else if (segment !== '.') {
                if (!current.children || !current.children[segment]) {
                    return null;
                }
                current = current.children[segment];
            }
        }

        return current;
    }

    /**
     * Lists the contents of a directory.
     * @param {string} [path] - The path to list (defaults to current directory).
     * @returns {string} - Formatted list of directory contents.
     */
    function ls(path) {
        const targetDir = path ? resolvePath(path, currentWorkingDirectory) : currentWorkingDirectory;

        if (!targetDir) {
            return `ls: cannot access '${path}': No such file or directory`;
        }

        if (targetDir.type === 'file') {
            return targetDir.name;
        }

        if (!targetDir.children || Object.keys(targetDir.children).length === 0) {
            return '';
        }

        const entries = Object.values(targetDir.children).map(node => {
            return node.type === 'dir' ? `${node.name}/` : node.name;
        });

        return entries.join('  ');
    }

    /**
     * Changes the current working directory.
     * @param {string} [path] - The path to change to (defaults to root).
     * @returns {string} - Error message if the path is invalid, empty string otherwise.
     */
    function cd(path) {
        const targetDir = path ? resolvePath(path, currentWorkingDirectory) : buildVirtualFileSystem(sitemapUrls);

        if (!targetDir) {
            return `cd: no such file or directory: ${path}`;
        }

        if (targetDir.type === 'file') {
            return `cd: not a directory: ${path}`;
        }

        currentWorkingDirectory = targetDir;
        terminalInputLabel.innerHTML = `anonymous@clueless.no:${currentWorkingDirectory.path === '/' ? '~' : currentWorkingDirectory.path}$`;
        return '';
    }

    /**
     * Displays the contents of a file.
     * @param path The path to the file.
     * @returns {Promise<string>} The file contents as HTML.
     */
    async function cat(path) {
        const vfsNode = resolvePath(path, currentWorkingDirectory);

        if (!vfsNode) {
            return `cat: ${path}: No such file or directory`;
        } else if (vfsNode.type === 'dir') {
            return `cat: ${path}: Is a directory`;
        } else {
            try {
                const fileContent = await fetchFile(vfsNode.path);
                return escapeHtml(fileContent);
            } catch (error) {
                return `cat: ${path}: Error reading file`;
            }
        }
    }

    async function fetchSitemap(){
        const response = await fetch("/sitemap.xml");
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        // noinspection CssInvalidHtmlTagReference
        return Array.from(xmlDoc.querySelectorAll("url loc")).map(el => el.textContent);
    }

    const sitemapUrls = await fetchSitemap();
    let currentWorkingDirectory = buildVirtualFileSystem(sitemapUrls);

    const commandHistory = [];
    let historyIndex = -1;

    /**
     * Gets completion candidates based on current input.
     * @param {string} input - The current input string.
     * @returns {string[]} - Array of possible completions.
     */
    function getCompletionCandidates(input) {
        const parts = input.split(' ');

        // If no space, complete command names
        if (parts.length === 1) {
            const prefix = parts[0].toLowerCase();
            return Object.keys(commandMap)
                .concat(['cat', 'clear'])
                .filter(cmd => cmd.startsWith(prefix))
                .sort();
        }

        // Otherwise, complete file/directory names
        const commandName = parts[0];
        const pathInput = parts.slice(1).join(' ');

        // Find the last segment to complete
        const lastSlashIndex = pathInput.lastIndexOf('/');
        const basePath = lastSlashIndex >= 0 ? pathInput.substring(0, lastSlashIndex + 1) : '';
        const prefix = lastSlashIndex >= 0 ? pathInput.substring(lastSlashIndex + 1) : pathInput;

        // Resolve the base directory
        const baseDir = basePath ? resolvePath(basePath, currentWorkingDirectory) : currentWorkingDirectory;

        if (!baseDir || baseDir.type !== 'dir' || !baseDir.children) {
            return [];
        }

        // Get matching entries
        return Object.keys(baseDir.children)
            .filter(name => name.startsWith(prefix))
            .map(name => {
                const node = baseDir.children[name];
                return basePath + name + (node.type === 'dir' ? '/' : '');
            })
            .sort();
    }

    /**
     * Finds the common prefix among an array of strings.
     * @param {string[]} strings - Array of strings.
     * @returns {string} - The common prefix.
     */
    function getCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];

        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (strings[i].indexOf(prefix) !== 0) {
                prefix = prefix.substring(0, prefix.length - 1);
                if (prefix === '') return '';
            }
        }
        return prefix;
    }

    const commandMap = {
        'ls': ls,
        'cd': cd,
        'dir': ls,
        'echo': (args) => args || '&nbsp'
    };

    /**
     * @type {HTMLTextAreaElement}
     */
    const terminalOutput = document.querySelector('.terminal-output');
    /**
     * @type {HTMLInputElement}
     */
    const terminalInput = document.querySelector('.terminal-input');
    /**
     * @type {HTMLLabelElement}
     */
    const terminalInputLabel = document.querySelector('.terminal-input-label');
    /**
     * @type {HTMLDivElement}
     */
    const terminalContainer = document.querySelector('.terminal-container');

    function renderLabel() {
        return `anonymous@clueless.no:${currentWorkingDirectory.path === '/' ? '~' : currentWorkingDirectory.path}$`;
    }

    /**
     * A cache of fetched files.
     * @type {Map<string, string>}
     */
    const fileCache = new Map();

    async function fetchFile(url) {
        if (fileCache.has(url)) {
            return fileCache.get(url);
        }

        const response = await fetch(url);
        const text = await response.text();
        fileCache.set(url, text);
        return text;
    }

    function escapeHtml(unsafe) {
        const p = document.createElement('p');
        p.innerText = unsafe;
        return p.innerHTML;
    }

    /**
     * Processes a command entered in the terminal input.
     * @param {'ls' | 'cd' | 'dir'} command
     */
    async function processCommand(command) {
        const args = command.split(' ');
        const commandName = args.shift();
        const commandArgs = args.join(' ');

        let output = `
        ${terminalOutput.innerHTML}
        <div class="terminal-line"><span class="terminal-input-label">${renderLabel()}</span> ${command}</div>
    `;

        switch (commandName) {
            case 'cat':
                const catOutput = await cat(commandArgs);
                output += `<div class="terminal-line">${catOutput}</div>`;
                break;
            case 'cd':
                const cdOutput = cd(commandArgs);
                if (cdOutput) {
                    output += `<div class="terminal-line">${cdOutput}</div>`;
                }
                break;
            case 'clear':
                output = '';
                break;
            case 'dir':
            case 'ls':
                output += `<div class="terminal-line">${ls(commandArgs)}</div>`;
                break;
            case 'echo':
                output += `<div class="terminal-line">${commandArgs || '&nbsp'}</div>`;
                break;
            default:
                output += `<div class="terminal-line">Command not found: ${commandName}</div>`;
        }

        terminalOutput.innerHTML = output;
        terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
    }

    terminalContainer.addEventListener('click', () => terminalInput.focus());

    terminalInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const input = event.target.value.trim();
            if (input) {
                commandHistory.push(input);
                historyIndex = commandHistory.length;
                await processCommand(input);
            }
            event.target.value = '';
        } else if (event.key === 'Tab') {
            event.preventDefault();

            const input = event.target.value;
            const candidates = getCompletionCandidates(input);

            if (candidates.length === 0) {
                return;
            }

            if (candidates.length === 1) {
                // Single match: complete it
                const parts = input.split(' ');
                if (parts.length === 1) {
                    event.target.value = candidates[0] + ' ';
                } else {
                    event.target.value = parts[0] + ' ' + candidates[0];
                }
            } else {
                // Multiple matches: complete to common prefix
                const commonPrefix = getCommonPrefix(candidates);
                const parts = input.split(' ');

                if (parts.length === 1) {
                    if (commonPrefix.length > input.length) {
                        event.target.value = commonPrefix;
                    }
                } else {
                    const pathInput = parts.slice(1).join(' ');
                    if (commonPrefix.length > pathInput.length) {
                        event.target.value = parts[0] + ' ' + commonPrefix;
                    }
                }
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                event.target.value = commandHistory[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                event.target.value = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex = commandHistory.length;
                event.target.value = '';
            }
        }
    });
})();