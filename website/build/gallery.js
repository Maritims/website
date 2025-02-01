class Lightbox extends HTMLElement {
    constructor() {
        super();
    }

    /**
     * @returns {HTMLElement}
     */
    createFigure() {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.setAttribute("src", this.getAttribute("src"));
        img.setAttribute("alt", this.getAttribute("alt"));

        const figcaption = document.createElement("figcaption");
        if(this.hasAttribute("time")) {
            figcaption.innerHTML = `<time>${this.getAttribute("time")}</time>: ${this.getAttribute("caption")}`;
        } else {
            figcaption.textContent = this.getAttribute("caption");
        }

        figure.appendChild(img);
        figure.appendChild(figcaption);
        return figure;
    }

    connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open"
        });

        const button = document.createElement("button");
        button.setAttribute("class", "thumbnail");
        button.setAttribute("popovertarget", `image-${this.getAttribute("data-image-id")}`);
        button.appendChild(this.createFigure());

        const dialog = document.createElement("dialog");
        dialog.setAttribute("class", "lightbox");
        dialog.setAttribute("id", `image-${this.getAttribute("data-image-id")}`);
        dialog.setAttribute("popover", "");
        dialog.appendChild(this.createFigure());

        const style = document.createElement("style");

        style.textContent = `
        img {
            max-width:100%;
            height: auto;
            margin: 0;
            border: none;
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

        shadow.appendChild(style);
        shadow.appendChild(button);
        shadow.appendChild(dialog);
    }
}

customElements.define("clueless-lightbox", Lightbox);