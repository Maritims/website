/**
 * @typedef {Object} ThemeTranslations
 */

class ThemeEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._storageKey = 'theme-editor-settings';

        this._translations = {
            "--main-color": "Text Color",
            "--main-background-color": "Background",
            "--secondary-background-color": "Surface",
            "--link-color": "Link Color",
            "--link-color-visited": "Visited Link",
            "--main-font-family": "Font Family",
            "--border-radius": "Corner Radius",
            "--border-width": "Border Thickness",
            "--spacing-unit": "Spacing"
        };

        this._fonts = [
            {label: 'System Sans', value: 'system-ui, sans-serif'},
            {label: 'Serif', value: 'Georgia, serif'},
            {label: 'Monospace', value: 'monospace'},
            {label: '90s Amateur', value: '"Comic Sans MS", "Comic Sans", cursive'}
        ];

        this._presets = {
            "default": {label: "Standard",
                values: {
                    "--main-color": "#333333",
                    "--main-background-color": "#ffffff",
                    "--secondary-background-color": "#f0f0f0",
                    "--link-color": "#0000ee",
                    "--link-color-visited": "#551a8b",
                    "--main-font-family": "system-ui, sans-serif",
                    "--border-radius": "4px",
                    "--border-width": "1px",
                    "--spacing-unit": "8px",
                    "--is-blinking": "none"
                }
            },
            "hacker": {label: "Hacker",
                values: {
                    "--main-color": "#00ff00",
                    "--main-background-color": "#000000",
                    "--secondary-background-color": "#0a0a0a",
                    "--link-color": "#00ff00",
                    "--link-color-visited": "#008800",
                    "--main-font-family": "monospace",
                    "--border-radius": "0px",
                    "--border-width": "1px",
                    "--spacing-unit": "6px",
                    "--is-blinking": "none"
                }
            },
            "geocities": {label: "GeoCities '96",
                values: {
                    "--main-color": "#0000FF",
                    "--main-background-color": "#C0C0C0",
                    "--secondary-background-color": "#FFFF00",
                    "--link-color": "#FF0000",
                    "--link-color-visited": "#800000",
                    "--main-font-family": '"Comic Sans MS", "Comic Sans", cursive',
                    "--border-radius": "0px",
                    "--border-width": "3px",
                    "--spacing-unit": "12px",
                    "--is-blinking": "inline"
                }
            },
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
                Object.entries(settings).forEach(([prop, val]) => document.documentElement.style.setProperty(prop, val));
            } catch (e) {
                console.error(e);
            }
        }
    }

    applyPreset(key) {
        if (key === 'random') {
            const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            const newTheme = Object.keys(this._translations).reduce((acc, prop) => {
                if (prop.includes('font')) acc[prop] = this._fonts[Math.floor(Math.random() * this._fonts.length)].value;
                else if (prop.includes('radius') || prop.includes('width') || prop.includes('spacing')) acc[prop] = Math.floor(Math.random() * 20) + "px";
                else acc[prop] = randomHex();
                return acc;
            }, {});
            Object.entries(newTheme).forEach(([p, v]) => document.documentElement.style.setProperty(p, v));
            localStorage.setItem(this._storageKey, JSON.stringify(newTheme));
        } else {
            const preset = this._presets[key];
            if (!preset) return;
            document.documentElement.removeAttribute('style');
            Object.entries(preset.values).forEach(([p, v]) => document.documentElement.style.setProperty(p, v));
            localStorage.setItem(this._storageKey, JSON.stringify(preset.values));
        }
        this.render();
    }

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

        const presetOptions = Object.entries(this._presets).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join('');

        const formFields = Object.entries(this._translations).map(([prop, label]) => {
            const val = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();

            if (prop.includes('font')) {
                const opts = this._fonts.map(f => `<option value="${f.value}" ${val.includes(f.value.split(',')[0]) ? 'selected' : ''}>${f.label}</option>`).join('');
                return `<label>${label}</label><select name="${prop}">${opts}</select>`;
            }

            if (prop.includes('radius') || prop.includes('width') || prop.includes('spacing')) {
                const num = parseInt(val) || 0;
                return `<label>${label}</label><input type="range" name="${prop}" min="0" max="30" value="${num}" />`;
            }

            const ctx = document.createElement('canvas').getContext('2d');
            ctx.fillStyle = val || '#000000';
            return `<label>${label}</label><input type="color" name="${prop}" value="${ctx.fillStyle}" />`;
        }).join('');

        this.shadowRoot.innerHTML = `
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
                        <option value="random">Randomize</option>
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

        this.shadowRoot.querySelector('#pre-sel').onchange = e => this.applyPreset(e.target.value);
        this.shadowRoot.querySelectorAll('input, select:not(#pre-sel)').forEach(el => {
            el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', e => {
                let val = e.target.value;
                if (e.target.type === 'range') val += 'px';
                document.documentElement.style.setProperty(e.target.name, val);
                const saved = JSON.parse(localStorage.getItem(this._storageKey) || '{}');
                saved[e.target.name] = val;
                localStorage.setItem(this._storageKey, JSON.stringify(saved));
            });
        });

        const d = this.shadowRoot.querySelector('#modal');
        this.shadowRoot.querySelector('#open').onclick = () => d.showModal();
        this.shadowRoot.querySelector('#close').onclick = () => d.close();
        this.shadowRoot.querySelector('#reset').onclick = () => {
            localStorage.removeItem(this._storageKey);
            document.documentElement.removeAttribute('style');
            this.render();
        };
    }
}

customElements.define('theme-editor', ThemeEditor);