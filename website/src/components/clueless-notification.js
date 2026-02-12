export class CluelessNotificationContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `<div class="notification-container"></div>`;

        this.querySelector('.notification-container').addEventListener('click', (event) => {
            if (event.target.classList.contains('close')) {
                event.target.closest('.notification').remove();
            }
        });
    }

    /**
     * Adds a notification to the notification container.
     * @param {CluelessNotification} notification
     */
    addNotification(notification) {
        this.querySelector('.notification-container').appendChild(notification);
    }
}

export class CluelessNotification extends HTMLElement {
    /**
     * @type {string} The notification title.
     */
    #title;
    /**
     * @type {string} The notification message.
     */
    #message;
    /**
     * @type {'success'|'error'} The notification type.
     */
    #type;

    /**
     * Creates a new CluelessNotification.
     * @param {string|undefined} title The notification title.
     * @param {string|undefined} message The notification message.
     * @param {'success'|'error'|undefined} type The notification type.
     */
    constructor(title = undefined, message = undefined, type = undefined) {
        super();
        this.#title = title;
        this.#message = message;
        this.#type = type;
    }

    static get observedAttributes() {
        return ['title', 'message', 'type'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case 'title':
                    this.#title = newValue;
                    break;
                case 'message':
                    this.#message = newValue;
                    break;
                case 'type':
            }
            this.render();
        }
    }

    connectedCallback() {
        if(!this.#title) {
            this.#title = this.getAttribute('title');
        }
        if(!this.#message) {
            this.#message = this.getAttribute('message');
        }
        if(!this.#type) {
            this.#type = this.getAttribute('type');
        }
        this.render();
    }

    render() {
        this.innerHTML = `
        <div class="notification ${this.#type}" role="alert">
            <div class="notification-header">
                <span>${this.#title}</span>
                <button type="button" class="close" aria-label="Close">Lukk</button>
            </div>
            <div class="notification-body">${this.#message}</div>
        </div>
        `;
    }
}

customElements.define('clueless-notification', CluelessNotification);
customElements.define('clueless-notification-container', CluelessNotificationContainer);