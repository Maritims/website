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
        const microserviceUrl = "__MICROSERVICE_URL__";

        const shadow = this.attachShadow({
            mode: "open"
        });

        const span = document.createElement('span');
        span.setAttribute("class", "hit-counter");

        let response;
        if(document.cookie.split("; ").find((row) => row.startsWith("hitHasBeenCounted=true"))) {
            response = await fetch(`${microserviceUrl}/hit`);
        } else {
            response = await fetch(`${microserviceUrl}/hit`, {
                method: "POST"
            });
            document.cookie = "hitHasBeenCounted=true; max-age=3600; path=/";
        }
        const json = await response.json();
        span.textContent = `${this.getAttribute("label")}: ${json.hitCount} (site counters, a thing of the past!)`;

        shadow.appendChild(span);
    }
}

customElements.define('clueless-hit-counter', HitCounter);

(function () {
    const scrollToTopButton = new ScrollToTopButton('scroll-to-top-button', document.documentElement, 0.1);
    scrollToTopButton.setupEvents();
})();