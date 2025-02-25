class ScrollToTopButton {
    /**
     * @type {HTMLButtonElement}
     */
    _buttonElement;
    /**
     * @type {Element}
     */
    _rootElement;
    /**
     * @type {number}
     */
    _scrollThreshold;

    /**
     * @param {string} buttonElementId 
     * @param {Element} rootElement
     * @param {number} scrollThreshold
     */
    constructor(buttonElementId, rootElement, scrollThreshold) {
        this._buttonElement = document.getElementById(buttonElementId);
        this._rootElement = rootElement;
        this._scrollThreshold = scrollThreshold;
    }

    scrollToTop() {
        this._rootElement.scrollTo({
            top: 0,
            behaviour: 'smooth'
        });
    }

    onScroll() {
        const scrollTotal = this._rootElement.scrollHeight - this._rootElement.clientHeight;
        if(this._rootElement.scrollTop / scrollTotal > this._scrollThreshold) {
            this._buttonElement.classList.add('show');
        } else {
            this._buttonElement.classList.remove('show');
        }
    }

    setupEvents() {
        this._buttonElement.addEventListener('click', () => this.scrollToTop());
        document.addEventListener('scroll', () => this.onScroll());
    }
}

class HitCounter extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open"
        });

        let response;
        if(document.cookie.split("; ").find((row) => row.startsWith("hitHasBeenCounted=true"))) {
            response = await fetch(`/microservice/hit`);
        } else {
            response = await fetch(`/microservice/hit`, {
                method: "POST"
            });
            document.cookie = "hitHasBeenCounted=true; max-age=3600; path=/";
        }

        const div = document.createElement('div');
        div.setAttribute("class", "badge");

        const left = document.createElement("div");
        left.setAttribute("class", "inner");
        left.textContent = ``;
        div.appendChild(left);

        const json = await response.json();
        left.textContent = `You are visitor #${json.hitCount}`;

        const style = document.createElement("style");
        style.textContent = `
        .badge {
            display: flex;
            width: 210px;
            height: 30px;
            border: 1px solid black;
            box-sizing: border-box;
            font-size: 1.1rem;
            text-decoration: none;
            font-family: 'Digital-7';
            background-color: black;
            color: #00FF00;

            .inner {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 1px;
                height: calc(100% - 2px);
                flex: 1;
                padding: 0 1px;
            }
        }
        `;

        shadow.appendChild(style);
        shadow.appendChild(div);
    }
}

customElements.define('clueless-hit-counter', HitCounter);

(function () {
    const scrollToTopButton = new ScrollToTopButton('scroll-to-top-button', document.documentElement, 0.1);
    scrollToTopButton.setupEvents();
})();