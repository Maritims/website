(
    /**
     * @param {string} guestbookApiUrl The URL of the guestbook API.
     * @returns {Promise<void>}
     */
    async (guestbookApiUrl) => {
        /**
         * @typedef {object} Entry
         * @property {string} id The ID of the entry.
         * @property {string} name The name of the person who wrote the entry.
         * @property {string} message The message written by the person.
         * @property {string} timestamp The time the entry was written.
         */

        /**
         * Renders an entry as HTML.
         * @param {Entry} entry The entry to render.
         * @returns {string} The rendered HTML.
         */
        function renderEntry(entry) {
            return `<article>
                    <h3>${entry.name}</h3>
                    <h4>${entry.timestamp}</h4>
                    <p>${entry.message}</p>
                </article>`;
        }

        /**
         * Renders a result message as HTML.
         * @param {string} title The title of the result message.
         * @param {string} message The message to display.
         * @param {'success'|'error'} className The CSS class to apply to the result message.
         */
        function renderResult(title, message, className) {
            const result = document.querySelector('.result');
            result.querySelector('.result-title > span').innerHTML = title;
            result.querySelector('.result-message').innerHTML = message;
            result.classList.add(className);
            result.removeAttribute('style');
        }

        document.querySelector('button.close').addEventListener('click', () => {
            const result = document.querySelector('.result');
            result.style.display = 'none';
            result.classList.remove('success', 'error');
            result.innerHTML = '';
        });

        document.querySelector('form#guestbook-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            event.submitter.disabled = true;

            /**
             * The form element that was submitted.
             * @type {HTMLFormElement}
             */
            const form = event.target;

            try {
                const response = await fetch(`${guestbookApiUrl}/entries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(new FormData(form)).toString()
                });

                if (response.ok) {
                    form.reset();
                    event.submitter.disabled = false;
                    renderResult('Success!', '<p>Thank you for your message! Your message has been submitted for moderator review.</p>', 'success');
                } else {
                    renderResult('Error!', `<p>Sorry, there was an error submitting your message. Please try again later.</p>`, 'error');
                }
            } catch (error) {
                renderResult('Error!', `<p>Sorry, there was an error submitting your message. Please try again later.</p>`, 'error');
            }
        });

        try {
            const response = await fetch(`${guestbookApiUrl}/entries`);
            if (response.ok) {
                /**
                 * @type {Entry[]}
                 */
                const entries = await response.json();

                entries.map(entry => document.querySelector('.entries').insertAdjacentHTML('beforeend', renderEntry(entry)))
            } else {
                console.error(`Failed to fetch entries: ${response.statusText}`);
                renderResult('Error!', `<p>Failed to fetch entries. Please try again later.`, 'error');
            }
        } catch (error) {
            console.error(`Failed to fetch entries: ${error}`);
            renderResult('Error!', `<p>Failed to fetch entries. Please try again later.`, 'error');
        }
    })('http://localhost:8080');