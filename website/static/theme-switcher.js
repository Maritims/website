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
        label: "LCARS",
        value: 'lcars'
    }];
    // noinspection JSUnusedGlobalSymbols
    _presets = {
        "hacker": {
            label: "Hacker",
            values: {
                "--font-family": "monospace",
                "--first-foreground-color": "#00ff00",
                "--first-background-color": "#000000",
                "--second-background-color": "#0a0a0a",
                "--link-color": "#00ff00",
                "--link-color-visited": "#008800",
                "--link-color-hover": "#00aa00",
                "--button-border-width": "1px",
                "--button-border-style": "solid",
                "--button-border-color": "#008800",
                "--button-background-color": "#000000",
                "--button-foreground-color": "#00FF00",
                "--button-hover-background-color": "#008800",
            }
        }
    };

    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.render();
    }

    /**
     * Render the theme editor dialogue.
     * @returns {void}
     */
    render() {
        const style = ``;

        this.innerHTML = `
            <style>${style}</style>
            <select>${this._themes.map(({label, value}) => `<option value="${value}" ${document.documentElement.classList.contains(value) ? 'selected' : ''}>${label}</option>`).join('')}</select>
        `;

        this.querySelector('select').addEventListener('change', event => {
            this._themes.forEach(theme => document.documentElement.classList.remove(theme.value));
            document.documentElement.classList.add(event.target.value);
        });
    }
}

customElements.define('theme-switcher', ThemeSwitcher);