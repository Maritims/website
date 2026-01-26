/**
 * @typedef {object} NavigationLink
 * @property {string} href
 * @property {string} label
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
            label: 'Home',
            href: '/',
        }, {
            label: 'Guestbook',
            href: '/guestbook.html',
        }, {
            label: 'EVE Online: Ninja Hacking Guide',
            href: '/eve-online-ninja-hacking-guide.html'
        }, {
            label: 'Gallery',
            href: '/gallery.html',
        }, {
            label: 'CV',
            href: '/cv.html',
        }, {
            label: 'Projects',
            href: '/projects.html',
        }, {
            label: 'Links',
            href: '/links.html',
        }, {
            label: 'Terminal',
            href: '/terminal.html',
        }];
    }

    render() {
        this.innerHTML = `
            <nav class="main-navigation">
                <ul class="horizontal-list">
                    ${this._navigationLinks.map(({ href, label }) =>`<li><a href="${href}" class="${window.location.pathname === href ? 'active' : ''}">${label}</a></li>`).join('')}
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