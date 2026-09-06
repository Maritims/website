export class Scene {
    constructor() {
        this.objects = [];
    }

    /**
     * Adds a renderable object to the scene.
     * @param {Object} object - Any object with a render(webglCtx, shader) method.
     */
    add(object) {
        this.objects.push(object);
    }

    /**
     * Removes an object from the scene.
     * @param {Object} object
     */
    remove(object) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }

    /**
     * Renders all object contained in the scene.
     * @param {WebGLRenderingContext} weblCtx
     * @param {ShaderProgram} shader
     * @param {Mat4} viewProjectionMatrix
     */
    render(weblCtx, shader, viewProjectionMatrix) {
        this.objects.forEach(object => object.render(weblCtx, shader, viewProjectionMatrix));
    }
}