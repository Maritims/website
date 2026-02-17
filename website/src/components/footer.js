export default class Footer extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            <footer>
                <scroll-to-top></scroll-to-top>
                <div>Kontakt meg på <a href="https://bsky.app/profile/maritims.bsky.social">Bluesky</a>, <a href="https://linkedin.com/in/martin-severin-steffensen">LinkedIn</a> eller <a href="https://github.com/Maritims">GitHub</a></div>
                <div class="badges">
                    <theme-switcher></theme-switcher>
                    <a href="https://pysj.party" target="_blank"><img src="/images/pysjparty-badge.webp" alt="pysjparty"></a>
                    <norsk-programmering-badge></norsk-programmering-badge>
                    <frk-frontend-badge></frk-frontend-badge>
                    <wiigen-badge></wiigen-badge>
                    <augustg-dev-badge></augustg-dev-badge>
                    <a href="https://signup.upcloud.com/?promo=32BW92"><img src="/images/upcloud.webp" alt="UpCloud Badge"></a>
                </div>
            </footer>
        `;
    }

    connectedCallback() {
        this.render();
    }
}

customElements.define('clueless-footer', Footer);
