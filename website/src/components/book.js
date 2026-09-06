/**
 * @property {string} title The title of the book.
 * @property {string} author The name of the author.
 * @property {number} rating A value from 1 to 6.
 * @property {Date} date-read A date in the format yyyy-MM-dd.
 */
export class CluelessBook extends HTMLElement {
    static observedAttributes = ['title', 'author', 'rating', 'date-read'];

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    get title() {
        return this.getAttribute('title') || '';
    }

    get author() {
        return this.getAttribute('author') || '';
    }

    get rating() {
        const value = this.getAttribute('rating');
        return value ? Number(value) : 0;
    }

    get dateRead() {
        return this.getAttribute('date-read') || '';
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
        <article itemscope itemtype="https://schema.org/Book">
            <div>
                <h2 itemprop="name">${this.title}</h2>
                <p>
                    Av <span itemprop="author" itemscope itemtype="https://schema.org/Person">${this.author}</span>
                </p>
                <div>
                    <p>
                        <strong>Terningkast:</strong> ${this.rating ? `${this.rating} / 6` : 'Not rated'}
                    </p>
                    <p>
                        <strong>Lest:</strong> <time datetime="${this.dateRead}">${this.dateRead || 'Ukjent'}</time>
                    </p>
                </div>
            </div>
        </article>
        `;
    }
}

customElements.define('clueless-book', CluelessBook);