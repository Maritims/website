/**
 * @typedef {object} Theme
 * @property {string} label
 * @property {string} value
 */

class ThemeSwitcher extends HTMLElement {
    /**
     * @type {Theme[]}
     * @private
     */
    _themes = [{
        label: "Default",
        value: 'default'
    }, {
        label: "Hacker",
        value: 'hacker'
    }, {
        label: "LCARS",
        value: 'lcars'
    }];

    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `<select>${this._themes.map(({label, value}) => `<option value="${value}" ${document.documentElement.classList.contains(value) ? 'selected' : ''}>${label}</option>`).join('')}</select>`;
        this.querySelector('select').addEventListener('change', event => {
            this._themes.forEach(theme => document.documentElement.classList.remove(theme.value));
            document.documentElement.classList.add(event.target.value);
        });
    }
}

customElements.define('theme-switcher', ThemeSwitcher);