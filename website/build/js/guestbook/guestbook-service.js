export default class GuestbookService {
    /**
     * @param {string} baseUrl
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * @param page
     * @return {Promise<FetchEntriesResult>}
     */
    async fetchEntries(page = 0) {
        const response = await fetch(`${this.baseUrl}/entries?page=${page}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`Could not fetch entries for ${response.status}`);
    }

    /**
     * @param {PostEntryRequest} postEntryRequest
     * @return {Promise<Entry>}
     */
    async postEntry(postEntryRequest) {
        const response = await fetch(`${this.baseUrl}/entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postEntryRequest),
        });
        if (response.ok) {
            return await response.json();
        }

        throw new Error(`An error occurred while attempting to post your message. Please try again later.`);
    }
}