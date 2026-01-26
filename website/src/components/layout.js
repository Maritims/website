import './navigation.js';
import './footer.js';
import './frk-frontend-badge.js';
import './norsk-programmering-badge.js';
import './wiigen-badge.js';
import './theme-switcher.js';

class Layout extends HTMLElement {
    constructor() {
        super();
        this._rendered = false;
    }

    render() {
        if (this._rendered) {
            return;
        }

        const htmlContent = this.innerHTML;

        this.innerHTML = `
            <div class="page-container">
                <header>
                    <clueless-navigation></clueless-navigation>
                </header>
                <main>
                    <h1>${document.title}</h1>
                    ${htmlContent}
                </main>
                <clueless-footer></clueless-footer>
            </div>
        `;

        this._rendered = true;
    }

    connectedCallback() {
        if(this.innerHTML.trim() === '') {
            requestAnimationFrame(() => this.render());
        } else {
            this.render();
        }
    }
}

customElements.define('clueless-layout', Layout);