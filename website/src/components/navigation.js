/**
 * @typedef {object} NavigationLinkOptions
 * @property {boolean} startsWith Whether the link should be active when the current URL path starts with the link's href.
 */

/**
 * @typedef {object} NavigationLink
 * @property {string} href The link's href.
 * @property {string} label The link's label.
 * @property {NavigationLinkOptions|undefined} [options] The link's options.
 */

/**
 * A navigation component.
 */
class Navigation extends HTMLElement {
    /**
     * @type {NavigationLink[]}
     * @private
     */
    _navigationLinks;

    constructor() {
        super();
        this._navigationLinks = [{
            label: 'Hjem',
            href: '/',
        }, {
            label: 'Blogg',
            href: '/blogg',
            options: {
                startsWith: true
            }
        }, {
            label: 'Om meg',
            href: '/about.html',
        }, {
            label: 'Gjestebok',
            href: '/guestbook.html',
        }, {
            label: 'Galleri',
            href: '/gallery.html',
        }, {
            label: 'CV',
            href: '/cv.html',
        }, {
            label: 'Prosjekter',
            href: '/projects.html',
        }, {
            label: 'Lenker',
            href: '/links.html',
        }, {
            label: 'Terminal',
            href: '/terminal.html',
        }];
    }

    /**
     * Checks if the given navigation link is active.
     * @param navigationLink The navigation link to check.
     * @return {boolean} Whether the link is active.
     */
    isActiveNavigationLink(navigationLink) {
        return navigationLink.options?.startsWith ? window.location.pathname.startsWith(navigationLink.href) : window.location.pathname === navigationLink.href;
    }

    render() {
        this.innerHTML = `
            <nav class="main-navigation">
                <ul>
                    ${this._navigationLinks.map(navigationLink => `<li><a href="${navigationLink.href}" class="${this.isActiveNavigationLink(navigationLink) ? 'active' : ''}">${navigationLink.label}</a></li>`).join('')}
                </ul>
            </nav>
        `;
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.render();
    }
}

customElements.define('clueless-navigation', Navigation);