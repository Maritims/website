import GuestbookService from './guestbook-service.js';
import GuestbookComponent from "./guestbook-component.js";

customElements.define('clueless-guestbook', GuestbookComponent);

(() => {
    const element = document.querySelector('clueless-guestbook');
    element.challengeUrl = 'http://localhost:8080/altcha';
    element.service = new GuestbookService('http://localhost:8080');
})();