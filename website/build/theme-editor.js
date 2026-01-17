/**
 * @typedef {Object} ThemeTranslations
 * @property {string} "--main-color"
 * @property {string} "--main-background-color"
 * @property {string} "--secondary-background-color"
 * @property {string} "--link-color"
 * @property {string} "--link-visited-color"
 */

class ThemeEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._storageKey = 'theme-editor-settings';

        /**
         * @type {ThemeTranslations}
         * @private
         */
        this._translations = {
            "--main-color": "Main color",
            "--main-background-color": "Main background color",
            "--secondary-background-color": "Secondary background color",
            "--link-color": "Link color",
            "--link-visited-color": "Link color (visited)"
        };
    }

    connectedCallback() {
        this.loadSavedTheme();
        this.render();
    }

    /**
     * Loads settings from localStorage and applies them to the document
     */
    loadSavedTheme() {
        const saved = localStorage.getItem(this._storageKey);
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.entries(settings).forEach(
                    /**
                     * @param {string} prop
                     * @param {string} value
                     */
                    ([prop, value]) => {
                    document.documentElement.style.setProperty(prop, value);
                });
            } catch (e) {
                console.error("Failed to parse saved theme", e);
            }
        }
    }

    /**
     * Saves a single property to localStorage
     * @param {string} property
     * @param {string} value
     */
    saveVariable(property, value) {
        const saved = localStorage.getItem(this._storageKey);
        const settings = saved ? JSON.parse(saved) : {};
        settings[property] = value;
        localStorage.setItem(this._storageKey, JSON.stringify(settings));
    }

    /**
     * Reverts to browser CSS defaults and clears storage
     */
    resetTheme() {
        localStorage.removeItem(this._storageKey);
        Object.keys(this._translations).forEach(prop => {
            document.documentElement.style.removeProperty(prop);
        });
        this.render(); // Re-render to update input colors
    }

    _getInitialValue(property) {
        // 1. Check computed style (which includes our current inline overrides)
        const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();

        // 2. Normalize to Hex for the input element
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = value || '#000000';
        return ctx.fillStyle;
    }
    render() {
        const style = `
            :host { font-family: system-ui, sans-serif; }
            #settings-dialog { border: none; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            #settings-dialog::backdrop { background: rgba(0,0,0,0.5); }
            
            form {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 15px;
                align-items: center;
                margin-bottom: 20px;
            }
            .element-group { display: contents; }
            label { font-size: 0.9rem; font-weight: 500; }
            input[type="color"] { cursor: pointer; border: 1px solid #ccc; border-radius: 4px; height: 30px; width: 50px; }
            button { cursor: pointer; padding: 8px 16px; border-radius: 4px; border: 1px solid #ccc; background: white; }
            #open-dialog { background: var(--main-color, #000); color: white; border: none; }
        `;
        const elementGroups = Object.entries(this._translations).map(([property, label]) => {
            const hexValue = this._getInitialValue(property);
            return `
                <div class="element-group">
                    <label for="${property}">${label}</label>
                    <input type="color" name="${property}" id="${property}" value="${hexValue}""/>
                </div>
            `;
        }).join('');

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <button type="button" id="open-dialog">Edit theme</button>
            <dialog id="settings-dialog">
                <h3 style="margin-top:0">Edit theme</h3>
                <form method="dialog">${elementGroups}</form>
                <div class="controls">
                    <button type="button" id="reset-btn">Reset</button>
                    <button type="button" id="close-dialog">Done</button>
                </div>
            </dialog>
        `;

        // Input listeners
        this.shadowRoot.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const { name, value } = e.target;
                document.documentElement.style.setProperty(name, value);
                this.saveVariable(name, value);
            });
        });

        // Dialog controls
        const dialog = this.shadowRoot.querySelector('#settings-dialog');
        this.shadowRoot.querySelector('#open-dialog').addEventListener('click', () => dialog.showModal());
        this.shadowRoot.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
        this.shadowRoot.querySelector('#reset-btn').addEventListener('click', () => this.resetTheme());
    }
}

customElements.define('theme-editor', ThemeEditor);