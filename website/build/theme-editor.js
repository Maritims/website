/**
 * @typedef {Object} ThemeTranslations
 * @property {string} "--main-color"
 * @property {string} "--main-background-color"
 * @property {string} "--secondary-background-color"
 * @property {string} "--link-color"
 * @property {string} "--link-color-visited"
 * @property {string} "--main-font-family"
 */

class ThemeEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._storageKey = 'theme-editor-settings';

        this._translations = {
            "--main-color": "Main color",
            "--main-background-color": "Main background color",
            "--secondary-background-color": "Secondary background color",
            "--link-color": "Link color",
            "--link-color-visited": "Link color (visited)",
            "--main-font-family": "Main font family"
        };

        this._fonts = [
            { label: 'System Sans', value: 'system-ui, sans-serif' },
            { label: 'Serif', value: 'Georgia, serif' },
            { label: 'Monospace', value: 'monospace' }
        ];

        // Define our Presets
        this._presets = {
            "default": {
                label: "Standard",
                values: {
                    "--main-color": "#333333",
                    "--main-background-color": "#ffffff",
                    "--secondary-background-color": "#f0f0f0",
                    "--link-color": "#0000ee",
                    "--link-color-visited": "#551a8b",
                    "--main-font-family": "system-ui, sans-serif"
                }
            },
            "hacker": {
                label: "Hacker",
                values: {
                    "--main-color": "#00ff00",
                    "--main-background-color": "#000000",
                    "--secondary-background-color": "#0a0a0a",
                    "--link-color": "#ffffff",
                    "--link-color-visited": "#cccccc",
                    "--main-font-family": "monospace"
                }
            }
        };
    }

    connectedCallback() {
        this.loadSavedTheme();
        this.render();
    }

    loadSavedTheme() {
        const saved = localStorage.getItem(this._storageKey);
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.entries(settings).forEach(([prop, value]) => {
                    document.documentElement.style.setProperty(prop, value);
                });
            } catch (e) { console.error(e); }
        }
    }

    /**
     * Applies a preset and saves the whole batch to storage
     */
    applyPreset(presetKey) {
        const preset = this._presets[presetKey];
        if (!preset) return;

        Object.entries(preset.values).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });

        localStorage.setItem(this._storageKey, JSON.stringify(preset.values));
        this.render(); // Re-draw inputs to show new values
    }

    saveVariable(property, value) {
        const saved = localStorage.getItem(this._storageKey);
        const settings = saved ? JSON.parse(saved) : {};
        settings[property] = value;
        localStorage.setItem(this._storageKey, JSON.stringify(settings));
    }

    resetTheme() {
        localStorage.removeItem(this._storageKey);
        Object.keys(this._translations).forEach(prop => {
            document.documentElement.style.removeProperty(prop);
        });
        this.render();
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
            #settings-dialog { border: none; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 350px;}
            #settings-dialog::backdrop { background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); }
            
            .preset-section { 
                display: flex; gap: 8px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; 
            }
            .preset-btn { 
                flex: 1; padding: 6px; font-size: 0.8rem; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; cursor: pointer;
            }
            .preset-btn:hover { background: #eee; }

            form { display: grid; grid-template-columns: 1fr 100px; gap: 12px; align-items: center; margin-bottom: 20px; }
            label { font-size: 0.85rem; color: #555; }
            input[type="color"], select { height: 32px; width: 100%; cursor: pointer; }
            
            .controls { display: flex; justify-content: space-between; align-items: center; }
            #reset-btn { color: #888; border: none; background: none; text-decoration: underline; font-size: 0.8rem; }
            #close-dialog { background: #333; color: white; border: none; padding: 8px 20px; border-radius: 6px; }
        `;

        const presetButtons = Object.entries(this._presets).map(([key, preset]) =>
            `<button type="button" class="preset-btn" data-preset="${key}">${preset.label}</button>`
        ).join('');

        const formElements = Object.entries(this._translations).map(([property, label]) => {
            const value = this._getCurrentValue(property);
            if (property.includes('font-family')) {
                const options = this._fonts.map(f =>
                    `<option value="${f.value}" ${value.includes(f.value.split(',')[0]) ? 'selected' : ''}>${f.label}</option>`
                ).join('');
                return `<label>${label}</label><select name="${property}">${options}</select>`;
            }
            return `<label>${label}</label><input type="color" name="${property}" value="${this._normalizeHex(value)}" />`;
        }).join('');

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <button type="button" id="open-dialog">Edit theme</button>
            <dialog id="settings-dialog">
                <h3 style="margin-top:0">Presets</h3>
                <div class="preset-section">${presetButtons}</div>
                
                <h3 style="font-size: 1rem;">Edit theme</h3>
                <form method="dialog">${formElements}</form>
                
                <div class="controls">
                    <button type="button" id="reset-btn">Clear All</button>
                    <button type="button" id="close-dialog">Done</button>
                </div>
            </dialog>
        `;

        // Presets logic
        this.shadowRoot.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });

        // Manual inputs logic
        this.shadowRoot.querySelectorAll('input, select').forEach(el => {
            el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', (e) => {
                document.documentElement.style.setProperty(e.target.name, e.target.value);
                this.saveVariable(e.target.name, e.target.value);
            });
        });

        const dialog = this.shadowRoot.querySelector('#settings-dialog');
        this.shadowRoot.querySelector('#open-dialog').addEventListener('click', () => dialog.showModal());
        this.shadowRoot.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
        this.shadowRoot.querySelector('#reset-btn').addEventListener('click', () => this.resetTheme());
    }
}

customElements.define('theme-editor', ThemeEditor);