/**
 * @typedef {Object} ThemeTranslations
 * @property {string} "--main-color"
 * @property {string} "--main-background-color"
 * @property {string} "--secondary-background-color"
 * @property {string} "--link-color"
 * @property {string} "--link-visited-color"
 * @property {string} "--main-font-family"
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
            "--link-color-visited": "Link color (visited)",
            "--main-font-family": "Main font family"
        };

        // Define available fonts
        this._fonts = [
            { label: 'System Sans', value: 'system-ui, sans-serif' },
            { label: 'Serif', value: 'Georgia, serif' },
            { label: 'Monospace', value: 'monospace' },
            { label: 'Cursive', value: 'cursive' }
        ];
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

    _getCurrentValue(property) {
        return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    }

    _normalizeHex(colorValue) {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = colorValue || '#000000';
        return ctx.fillStyle;
    }

    render() {
        const style = `
            :host { font-family: system-ui, sans-serif; }
            #settings-dialog { border: none; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 350px;}
            #settings-dialog::backdrop { background: rgba(0,0,0,0.5); }
            
            form {
                display: grid;
                grid-template-columns: 1fr 120px;
                gap: 15px;
                align-items: center;
                margin-bottom: 20px;
            }
            label { font-size: 0.9rem; font-weight: 500; }
            input[type="color"], select { 
                cursor: pointer; 
                border: 1px solid #ccc; 
                border-radius: 4px; 
                height: 32px; 
                width: 100%;
                box-sizing: border-box;
            }
            .controls { display: flex; justify-content: flex-end; gap: 8px; }
            button { cursor: pointer; padding: 8px 16px; border-radius: 4px; border: 1px solid #ccc; background: white; }
            #open-dialog { background: var(--main-color, #000); color: white; border: none; }
        `;
        const formElements = Object.entries(this._translations).map(([property, label]) => {
            const value = this._getCurrentValue(property);

            // Check if it's a font-family property
            if (property.includes('font-family')) {
                const options = this._fonts.map(f =>
                    `<option value="${f.value}" ${value.includes(f.value.split(',')[0]) ? 'selected' : ''}>${f.label}</option>`
                ).join('');

                return `
                    <label for="${property}">${label}</label>
                    <select name="${property}" id="${property}">${options}</select>
                `;
            }

            // Default to color input
            const hexValue = this._normalizeHex(value);
            return `
                <label for="${property}">${label}</label>
                <input type="color" name="${property}" id="${property}" value="${hexValue}" />
            `;
        }).join('');

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <button type="button" id="open-dialog">Edit theme</button>
            <dialog id="settings-dialog">
                <h3 style="margin-top:0">Edit theme</h3>
                <form method="dialog">${formElements}</form>
                <div class="controls">
                    <button type="button" id="reset-btn">Reset</button>
                    <button type="button" id="close-dialog">Done</button>
                </div>
            </dialog>
        `;

        // Listen for both color 'input' and select 'change'
        this.shadowRoot.querySelectorAll('input, select').forEach(el => {
            const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(eventType, (e) => {
                const { name, value } = e.target;
                document.documentElement.style.setProperty(name, value);
                this.saveVariable(name, value);
            });
        });

        const dialog = this.shadowRoot.querySelector('#settings-dialog');
        this.shadowRoot.querySelector('#open-dialog').addEventListener('click', () => dialog.showModal());
        this.shadowRoot.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
        this.shadowRoot.querySelector('#reset-btn').addEventListener('click', () => this.resetTheme());
    }
}

customElements.define('theme-editor', ThemeEditor);