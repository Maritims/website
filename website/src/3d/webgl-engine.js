import {Mat4} from "./mat4.js";

export class WebGLEngine {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this._ctx = canvas.getContext('webgl');

        if (!this.ctx) {
            throw new Error('WebGL is not supported.')
        }

        this.scene = null;

        // Camera state.
        this.cameraX = 0.0;
        this.cameraY = -1.0;
        this.cameraZ = -4.5;
        this.cameraYaw = 0.0;

        // Input state.
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.keys = {};

        this._configureKeyBindings();
    }

    get ctx() {
        return this._ctx;
    }

    _configureKeyBindings() {
        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.cameraZ -= event.deltaY * 0.003;
            this.cameraZ = Math.max(-10.0, Math.min(-2.0, this.cameraZ));
        });

        this.canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        });

        window.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;

            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;

            const speed = 0.002 * Math.abs(this.cameraZ);
            this.cameraX += deltaX * speed;
            this.cameraY -= deltaY * speed;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('keydown', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'q', 'e', 'x'].includes(event.key)) {
                event.preventDefault();
            }
            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    /**
     * Sets the active scene to be rendered by the engine.
     * @param {Object} scene
     */
    setScene(scene) {
        this.scene = scene;
        return this;
    }

    _updateCamera() {
        const xSpeed = 0.005;
        const ySpeed = 0.005;
        const zSpeed = 0.005;
        const turnSpeed = 0.005;

        if (this.keys['q']) this.cameraX += xSpeed;
        if (this.keys['e']) this.cameraX -= xSpeed;
        if (this.keys['w']) this.cameraZ += zSpeed;
        if (this.keys['a']) this.cameraYaw -= turnSpeed;
        if (this.keys['s']) this.cameraZ -= zSpeed;
        if (this.keys['d']) this.cameraYaw += turnSpeed;
        if (this.keys['x']) this.cameraY += ySpeed;
        if (this.keys[' ']) this.cameraY -= ySpeed;
    }

    start = () => {
        const loop = () => {
            this._updateCamera();

            const ctx = this.ctx;
            ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
            ctx.clearColor(0.05, 0.05, 0.08, 1.0);
            ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
            ctx.enable(ctx.DEPTH_TEST);

            // Compute generic camera view-projection matrix
            const aspect = this.canvas.width / this.canvas.height;
            const projection = Mat4.perspective(Math.PI / 4, aspect, 0.1, 100.0);
            const viewMatrix = new Mat4()
                .rotateY(this.cameraYaw)
                .translate(this.cameraX, this.cameraY, this.cameraZ);
            const viewProjectionMatrix = projection.multiply(viewMatrix);

            // If a scene is attached, let it render using its shader/components
            if (this.scene && typeof this.scene.renderAll === 'function') {
                this.scene.renderAll(ctx, viewProjectionMatrix);
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}