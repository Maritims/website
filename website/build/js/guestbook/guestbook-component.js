export default class GuestbookComponent extends HTMLElement {
    constructor() {
        super();
        this._challengeUrl = null;
        this._service = null;
        this._state = {
            entries: [],
            totalEntries: 0,
            totalPages: 0,
            currentPage: 0,
            size: 0
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} challengeUrl
     */
    set challengeUrl(challengeUrl) {
        this._challengeUrl = challengeUrl;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {GuestbookService} service
     */
    set service(service) {
        this._service = service;
        this.loadPage(0).then(_ => {});
    }

    async loadPage(page) {
        if(!this._service) {
            return;
        }

        try {
            const result = await this._service.fetchEntries(page);
            this._state = {
                ...this._state,
                entries: result.entries,
                totalEntries: result.totalEntries,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                size: result.size,
            };
            this.render();
        } catch (error) {
            this.notify('Error!', error.message, 'error');
        }
    }

    /**
     * @param {SubmitEvent} event
     * @return {Promise<void>}
     */
    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        /**
         * @type {PostEntryRequest}
         */
        const payload = {
            name: formData.get('name').toString(),
            message: formData.get('message').toString(),
            altcha: formData.get('altcha').toString(),
            token: formData.get('token').toString()
        };

        try {
            await this._service.postEntry(payload);
            this.notify('Success!', 'Entry posted successfully.', 'success');
            event.target.reset();
        } catch (error) {
            this.notify('Error!', error.message, 'error');
        }
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} type
     */
    notify(title, message, type) {
        this.querySelector('.notification-container').innerHTML = `
            <div class="notification ${type}" role="alert">
                <div class="notification-header">
                    <span>${title}</span>
                    <button type="button" class="close" aria-label="Close">Close</button>
                </div>
                <div class="notification-body">${message}</div>
            </div>
        `;
    }

    render() {
        this.style.display = 'grid';
        this.style.gap = '1em';

        this.innerHTML = `
            <form id="guestbook-form">
                <div class="form-controls">
                    <label for="name">Name</label>
                    <input type="text" name="name" id="name" required autofocus autocomplete="name"/>
        
                    <label for="message">Message</label>
                    <textarea name="message" id="message" required></textarea>
                    
                    <input type="text" name="token" style="display:none !important;" tabindex="-1" autocomplete="off">
                    <altcha-widget name="altcha" challengeUrl="${this._challengeUrl}" floating="top"></altcha-widget>
                </div>
                <div class="form-actions">
                    <button type="submit">Submit message</button>
                </div>
            </form>
            
            <div class="notification-container"></div>
            
            <div class="entries">
                ${this._state.entries.map(entry => `
                    <article>
                        <h3>${entry.name}</h3>
                        <h4>${new Date(entry.timestamp + 'Z').toLocaleString()}</h4>
                        <p>${entry.message}</p>
                    </article>
                `).join('')}
            </div>
            
            <nav class="pagination">${Array.from({length: this._state.totalPages}, (_, i) => i)
            .map(num => `<button class="${num === this._state.currentPage ? 'active' : ''}" data-page="${num}">${num + 1}</button>`)
            .join('')}</nav>
        `;

        this.querySelector("#guestbook-form").onsubmit = (event) => this.handleSubmit(event);
        this.querySelector('.notification-container').addEventListener('click', (event) => {
            if (event.target.classList.contains('close')) {
                event.target.closest('.notification').remove();
            }
        });
        this.querySelectorAll(".pagination button").forEach(button => {
            button.onclick = () => this.loadPage(button.dataset.page);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.render();
    }
}