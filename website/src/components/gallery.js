class Lightbox extends HTMLElement {
    constructor() {
        super();
    }

    getCaptionWithTimeIfSet() {
        let completeCaption = this.getAttribute('time');
        if(completeCaption) {
            completeCaption += ': ';
        }
        completeCaption += this.getAttribute('caption');
        return completeCaption;
    }

    /**
     * @returns {string}
     */
    createFigure() {
        return `
            <figure>
                <img src="${this.getAttribute("src")}" alt="${this.getAttribute("alt")}">
                <figcaption>${this.getCaptionWithTimeIfSet()}</figcaption>
            </figure>
        `;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const style = `
        img {
            max-width:100%;
            height: auto;
            margin: 0;
            border: none;
            object-fit: cover;
        }

        figure {
            display: flex;
            flex-flow: column;
            margin: 0;
        }

        .thumbnail {
            border: none;
            cursor: pointer;
            padding: 0;
            display: flex;
            background-color: white;

            figure {
                figcaption {
                    padding: 8px;
                }

                img {
                    aspect-ratio: 4/3;
                    height:100%;
                    object-fit: cover;
                }
            }
        }

        .lightbox {
            padding: 0;
            border: none;
            overflow: hidden;
            max-width: 50vh;
            max-height: 90vh;

            &::backdrop {
                background-color: black;
                opacity: 0.5;
            }

            figcaption {
                padding: 16px;
                text-align: center;
            }

            img {
                max-height: 80vh;
                justify-items: center;
                align-content: center;
            }
        }
        `;

        this.innerHTML = `
            <style>${style}</style>
            <button class="thumbnail" popovertarget="image-${this.getAttribute("data-image-id")}">${this.createFigure()}</button>
            <dialog class="lightbox" id="image-${this.getAttribute("data-image-id")}" popover="">${this.createFigure()}</dialog>
        `;
    }
}

customElements.define("clueless-lightbox", Lightbox);