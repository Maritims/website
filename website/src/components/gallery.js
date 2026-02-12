class Lightbox extends HTMLElement {
    _imageId;
    _src;
    _alt;
    _caption;
    _date;
    _width;
    _height;

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['imageId', 'src', 'alt', 'caption', 'date', 'width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case 'imageId':
                    this._imageId = newValue;
                    break;
                case 'src':
                    this._src = newValue;
                    break;
                case 'alt':
                    this._alt = newValue;
                    break;
                case 'caption':
                    this._caption = newValue;
                    break;
                case 'date':
                    this._date = newValue;
                    break;
                case 'width':
                    this._width = newValue;
                    break;
                case 'height':
                    this._height = newValue;
                    break;
                default:
                    throw new Error(`Unknown attribute: ${name}`);
            }
        }
    }

    connectedCallback() {
        this._imageId = this.getAttribute('imageId');
        this._src = this.getAttribute('src');
        this._alt = this.getAttribute('alt');
        this._caption = this.getAttribute('caption');
        this._date = this.getAttribute('date');
        this._width = this.getAttribute('width');
        this._height = this.getAttribute('height');

        this.render();
    }

    render() {
        this.innerHTML = `
        <div class="image">
            <button popovertarget="${this._imageId}">
                <img src="${this._src}" width="${this._width}" height="${this._height}"
                     alt="${this._alt}">
            </button>
            <dialog id="${this._imageId}" popover>
                <figure>
                    <img src="${this._src}" width="${this._width}" height="${this._height}" alt="${this._alt}">
                    <figcaption>${this._date}: ${this._caption}</figcaption>
                </figure>
            </dialog>
        </div>
        `;
    }
}

customElements.define("clueless-lightbox", Lightbox);