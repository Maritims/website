class ScrollToTop extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupLogic();
    }

    setupLogic() {
        const btn = this.shadowRoot.querySelector('button');

        // Click logic
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Visibility logic (hide when at the top)
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
            } else {
                btn.style.opacity = "0";
                btn.style.pointerEvents = "none";
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-size: 2rem;
                    background: #333;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                }
                button:hover { background: #555; }
            </style>
            <button aria-label="Scroll to top">☝️</button>
        `;
    }
}
customElements.define('scroll-to-top', ScrollToTop);