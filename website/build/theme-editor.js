/**
 * @typedef {Object} ThemeTranslations
 */

class ThemeEditor extends HTMLElement {
    /**
     * @type {string[]} The CSS properties that can be edited.
     * @private
     */
    _cssProperties = [
        "--font-family",
        "--first-foreground-color",
        "--first-background-color",
        "--second-background-color",
        "--link-color",
        "--link-color-visited",
        "--link-color-hover",
        "--link-color-active",
        "--button-border-width",
        "--button-border-style",
        "--button-border-color",
        "--button-border-radius",
        "--button-background-color",
        "--button-foreground-color",
        "--button-hover-background-color",
        "--button-padding"
    ];

    _fonts = [{
        label: 'System Sans',
        value: 'system-ui, sans-serif'
    }, {
        label: 'Serif',
        value: 'Georgia, serif'
    }, {
        label: 'Monospace',
        value: 'monospace'
    }];

    _presets = {
        "default": {
            label: "Standard",
            values: {}
        },
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
        },
        "lcars": {
            label: "LCARS",
            values: {
                "--font-family": "'Antonio', 'Arial Narrow', 'Avenir Next Condensed', system-ui, sans-serif",
                "--first-foreground-color": "rgb(255, 153, 0)",
                "--first-background-color": "#000000",
                "--second-background-color": "#1a1a1a",
                "--link-color": "#ff9966",
                "--link-color-visited": "#cc9966",
                "--link-color-hover": "#ffcc99",
                "--button-border-width": "0px",
                "--button-border-style": "none",
                "--button-border-color": "transparent",
                "--button-border-radius": "50px",
                "--button-background-color": "rgb(255, 170, 144)",
                "--button-foreground-color": "#000000",
                "--button-hover-background-color": "rgb(255, 170, 144)",
                "--button-padding": "10px 20px"
            }
        },
    };
    _storageKey = 'theme-editor-settings';
    _translations = {
        "--font-family": "Font Family",
        "--first-foreground-color": "First foreground color",
        "--first-background-color": "First background color",
        "--second-background-color": "Second background color",
        "--link-color": "Link color",
        "--link-color-visited": "Link color (visited)",
        "--link-color-hover": "Link color (hover)",
        "--link-color-active": "Link color (active)",
        "--button-border-color": "Button border color",
        "--button-background-color": "Button background color",
        "--button-foreground-color": "Button foreground color",
        "--button-hover-background-color": "Button hover background color",
    };

    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.loadSavedTheme();
        this.render();
    }

    /**
     * Load the saved theme from local storage.
     * @returns {void}
     */
    loadSavedTheme() {
        const saved = localStorage.getItem(this._storageKey);
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.entries(settings).forEach(([prop, val]) => document.documentElement.style.setProperty(prop, val));
            } catch (e) {
                console.error(e);
            }
        }
    }

    /**
     * Apply a preset to the theme.
     * @param {string} presetKey
     */
    applyPreset(presetKey) {
        const preset = this._presets[presetKey];
        if (!preset) {
            return;
        }

        document.documentElement.removeAttribute('style');
        this._cssProperties.forEach(
            (property) => {
                const value = preset.values[property] || "revert";
                document.documentElement.style.setProperty(property, value)
            });
        localStorage.setItem(this._storageKey, JSON.stringify(preset.values));

        this.render();
    }

    /**
     * Convert a colour to a hex string.
     * @param {string} colour The colour string, e.g. "rgb(255, 0, 0)" or "red".
     * @param {string} defaultColour The default colour to use if the colour is invalid.
     * @returns {string} The hex string, e.g. "#000000" or "#ffffff". Default is black.
     */
    colourToHex(colour, defaultColour = '#000000') {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = colour || defaultColour
        return ctx.fillStyle;
    }

    /**
     * Render the theme editor dialog.
     * @returns {void}
     */
    render() {
        const style = `
            form { 
                display: grid; 
                grid-template-columns: auto 1fr; 
                gap: 10px; 
                align-items: center; 
                margin: 15px 0;
            }
            .controls { 
                display: flex; 
                justify-content: flex-end; 
                gap: 10px; 
                margin-top: 20px; 
            }
            hr { border: 0; border-top: 1px solid #eee; margin: 15px 0; }
            #open {
                height: 30px;
            }
        `;

        const presetOptions = Object.entries(this._presets).map(([presetKey, preset]) => `<option value="${presetKey}">${preset.label}</option>`).join('');

        const formFields = Object.entries(this._translations).map(([property, label]) => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
            console.log(property, value);

            if (property.includes('font')) {
                const options = this._fonts.map(f => `<option value="${f.value}" ${value.includes(f.value.split(',')[0]) ? 'selected' : ''}>${f.label}</option>`).join('');
                return `<label>${label}</label><select name="${property}">${options}</select>`;
            } else {
                return `<label>${label}</label><input type="color" name="${property}" value="${this.colourToHex(value)}" />`;
            }
        }).join('');

        this.innerHTML = `
            <style>${style}</style>
            <button type="button" id="open">Edit theme</button>
            <dialog id="modal">
                <header>
                    <strong>Edit theme</strong>
                </header>
                
                <p>
                    <label>Preset: </label>
                    <select id="pre-sel">
                        <option value="" disabled selected>Select...</option>
                        ${presetOptions}
                    </select>
                </p>

                <hr>

                <form method="dialog">
                    ${formFields}
                </form>

                <div class="controls">
                    <button type="button" id="reset">Reset</button>
                    <button type="button" id="close">Done</button>
                </div>
            </dialog>
        `;

        this.querySelector('#pre-sel').onchange = e => this.applyPreset(e.target.value);
        this.querySelectorAll('input, select:not(#pre-sel)').forEach(element => {
            element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', event => {
                document.documentElement.style.setProperty(event.target.name, event.target.value);

                const saved = JSON.parse(localStorage.getItem(this._storageKey) || '{}');
                saved[event.target.name] = event.target.value;

                localStorage.setItem(this._storageKey, JSON.stringify(saved));
            });
        });

        const dialog = this.querySelector('#modal');
        this.querySelector('#open').onclick = () => dialog.showModal();
        this.querySelector('#close').onclick = () => dialog.close();
        this.querySelector('#reset').onclick = () => {
            localStorage.removeItem(this._storageKey);
            document.documentElement.removeAttribute('style');
            this.render();
        };
    }
}

customElements.define('theme-editor', ThemeEditor);