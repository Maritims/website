class CameraHUD extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['x', 'y', 'z', 'yaw', 'pitch', 'roll'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const x = this.getAttribute('x') || '0.00';
        const y = this.getAttribute('y') || '0.00';
        const z = this.getAttribute('z') || '0.00';
        const yaw = this.getAttribute('yaw') || '0';
        const pitch = this.getAttribute('pitch') || '0';
        const roll = this.getAttribute('roll') || '0';

        this.innerHTML = `
        <div class="position-and-rotation">
            Position - X: ${x} | Y: ${y} | Z: ${z}<br>
            Rotation - Yaw: ${yaw}° | Pitch: ${pitch}° | Roll: ${roll}°<br>
        </div>
        <div class="button-container">
            <button class="reset-position">Reset position</button>
            <button class="reset-rotation">Reset rotation</button>
        </div>
        `;

        this.querySelector('.reset-position').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('camera-reset', {
                detail: {
                    target: 'position'
                },
                bubbles: true,
                composed: true
            }));
        });

        this.querySelector('.reset-rotation').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('camera-reset', {
                detail: {
                    target: 'rotation'
                },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('camera-hud', CameraHUD);