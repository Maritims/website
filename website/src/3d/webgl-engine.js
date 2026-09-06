import {Mat4} from "./math/mat4.js";
import {Camera} from "./geometry/camera.js";

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
        this.camera = new Camera(-2.5, 2.5, 3, -0.82, -0.4, 0);

        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        /**
         * @type {CameraHUD}
         */
        this.cameraHUD = document.querySelector('camera-hud');

        if (this.cameraHUD) {
            this.cameraHUD.addEventListener('camera-reset', (event) => {
                if (event.detail.target === 'position') {
                    this.camera.x = 0;
                    this.camera.y = 1.6;
                    this.camera.z = 3.0;
                } else if (event.detail.target === 'rotation') {
                    this.camera.yaw = 0;
                    this.camera.pitch = 0;
                    this.camera.roll = 0;
                }
            })
        }
    }

    get ctx() {
        return this._ctx;
    }

    /**
     * Sets the active scene to be rendered by the engine.
     * @param {Object} scene
     */
    setScene(scene) {
        this.scene = scene;
        return this;
    }

    start = () => {
        const loop = () => {
            this.camera.update(this.keys);

            const ctx = this.ctx;
            ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
            ctx.clearColor(0.05, 0.05, 0.08, 1.0);
            ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
            ctx.enable(ctx.DEPTH_TEST);

            // Compute generic camera view-projection matrix
            const aspect = this.canvas.width / this.canvas.height;
            const projectMatrix = Mat4.perspective(Math.PI / 4, aspect, 0.1, 100.0);
            const viewMatrix = this.camera.getViewMatrix();
            const viewProjectionMatrix = projectMatrix.multiply(viewMatrix);

            // If a scene is attached, let it render using its shader/components
            if (this.scene && typeof this.scene.renderAll === 'function') {
                this.scene.renderAll(ctx, viewProjectionMatrix);
            }

            if (this.cameraHUD) {
                const radToDeg = 180 / Math.PI;

                this.cameraHUD.setAttribute('x', this.camera.x.toFixed(2));
                this.cameraHUD.setAttribute('y', this.camera.y.toFixed(2));
                this.cameraHUD.setAttribute('z', this.camera.z.toFixed(2));
                this.cameraHUD.setAttribute('yaw', (this.camera.yaw * radToDeg).toFixed(0));
                this.cameraHUD.setAttribute('pitch', (this.camera.pitch * radToDeg).toFixed(0));
                this.cameraHUD.setAttribute('roll', (this.camera.roll * radToDeg).toFixed(0));
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}