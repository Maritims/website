/**
 * @typedef {object} NavigationLink
 * @property {string} href
 * @property {string} label
 */

/**
 * A navigation component.
 */
export default class Navigation extends HTMLElement {
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
                    ${this._navigationLinks.map(({ href, label }) =>`<li><a href="${href}">${label}</a></li>`).join('')}
                </ul>
            </nav>
        `;
    }

    connectedCallback() {
        this.render();
    }
}

customElements.define('clueless-navigation', Navigation);