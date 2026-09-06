export class ShaderProgram {
    /**
     * Compiles and links vertex and fragment shaders into a usable WebGL program.
     * @param {WebGLRenderingContext} ctx The WebGL context.
     * @param {string} vertexSource The GLSL code for the vertex shader.
     * @param {string} fragmentSource The GlSL Code for the fragment shader.
     */
    constructor(ctx, vertexSource, fragmentSource) {
        this.ctx = ctx;

        const vertexShader = this._compileShader(ctx.VERTEX_SHADER, vertexSource);
        const fragmentShader = this._compileShader(ctx.FRAGMENT_SHADER, fragmentSource);

        this.program = ctx.createProgram();
        ctx.attachShader(this.program, vertexShader);
        ctx.attachShader(this.program, fragmentShader);
        ctx.linkProgram(this.program);

        if (!ctx.getProgramParameter(this.program, ctx.LINK_STATUS)) {
            const info = ctx.getProgramInfoLog(this.program);
            ctx.deleteProgram(this.program);
            throw new Error(`Could not compile WebGL program: ${info}`);
        }
    }

    /**
     * Compiles a shader.
     * @param {GLenum} type Either vertex or fragment.
     * @param {string} source GLSL code.
     * @return {WebGLShader}
     * @private
     */
    _compileShader(type, source) {
        const ctx = this.ctx;
        const shader = ctx.createShader(type);
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);

        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            const info = ctx.getShaderInfoLog(shader);
            ctx.deleteShader(shader);
            throw new Error(`Could not compile shader: ${info}`);
        }

        return shader;
    }

    /**
     * Activates this shader program for rendering.
     */
    use() {
        this.ctx.useProgram(this.program);
    }

    /**
     * Gets the memory location of a vertex attribute.
     * @param {string} name
     * @return {GLint}
     */
    getAttributeLocation(name) {
        return this.ctx.getAttribLocation(this.program, name);
    }

    /**
     * Gets the memory location of a uniform variable.
     * @param {string} name
     * @return {WebGLUniformLocation}
     */
    getUniformLocation(name) {
        return this.ctx.getUniformLocation(this.program, name);
    }

    /**
     * Upload a Mat4 instance to a uniform matrix.
     * @param {string} name
     * @param {Mat4} mat4
     */
    setUniformMatrix4fv(name, mat4) {
        const location = this.getUniformLocation(name);
        this.ctx.uniformMatrix4fv(location, false, mat4.data);
    }

    /**
     * Upload an RGB value to a uniform variable.
     * @param {string} name
     * @param {number} red A value from 0.0 to 1.0.
     * @param {number} green A value from 0.0 to 1.0.
     * @param {number} blue A value from 0.0 to 1.0.
     * @param alpha A value from 0.0 to 1.0.
     */
    setUniform4f(name, red, green, blue, alpha) {
        const location = this.getUniformLocation(name);
        this.ctx.uniform4f(location, red, green, blue, alpha);
    }

    setUniform1i(name, i) {
        const location = this.getUniformLocation(name);
        this.ctx.uniform1i(location, i);
    }
}