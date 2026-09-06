class KeyBindingsHUD extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .title {
                    margin-block-start: var(--spacing);
                }
                .keys {
                    padding: var(--spacing);
                    text-align: center;
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    white-space: nowrap;
                }
                .grid {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: var(--spacing);
                    align-items: center;
                    border-radius: 3px;
                    margin-block-start: var(--spacing);
                    
                    > div:nth-child(odd) {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: var(--spacing);
                    }
                }
            </style>
            <div class="title">CONTROLS</div>
            <div class="grid">
                <div>
                    <span class="keys">W</span>                
                    <span class="keys">S</span>                
                </div>
                <div>Move forward / backward</div>
                
                <div>
                    <span class="keys">A</span>
                    <span class="keys">D</span>
                </div>
                <div>Turn left / right</div>
                
                <div>
                    <span class="keys">Q</span>
                    <span class="keys">E</span>
                </div>
                <div>Strafe left / right</div>
                
                <div>
                    <span class="keys">R</span>
                    <span class="keys">F</span>
                </div>
                <div>Tilt upward / downward</div>
                
                <div>
                    <span class="keys">Z</span>
                    <span class="keys">C</span>
                </div>
                <div>Roll left / right</div>
                
                <div>
                    <span class="keys">Space</span>
                    <span class="keys">X</span>
                </div>
                <div>Move upward / downward</div>
            </div>
        `;
    }
}

// Register the custom HTML tag
customElements.define('key-bindings-hud', KeyBindingsHUD);