import {Mat4} from "../math/mat4.js";

export class Floor {
    /**
     *
     * @param {WebGLRenderingContext} ctx
     * @param {number} width
     * @param {number} depth
     * @param {ShaderProgram} shader
     * @param {PlaneMesh} planeGeometry
     * @param {number[]} color
     */
    constructor(ctx, width, depth, shader, planeGeometry, color) {
        this.shader = shader;
        this.mesh = planeGeometry;
        this.color = color || [0.25, 0.18, 0.12, 1.0];

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.width = width;
        this.depth = depth;
    }

    render(ctx, shaderProgram, viewProjectionMatrix) {
        this.shader.use();

        const posLoc = this.shader.getAttributeLocation('a_position');
        const normLoc = this.shader.getAttributeLocation('a_normal');
        const texCoordLoc = this.shader.getAttributeLocation('a_texCoord');

        // Scale the base 1x1 plane to the desired room width and depth
        const modelMatrix = new Mat4()
            .translate(this.x, this.y, this.z)
            .scale(this.width, 1.0, this.depth);

        const mvp = viewProjectionMatrix.multiply(modelMatrix);

        this.shader.setUniformMatrix4fv('u_matrix', mvp);
        this.shader.setUniform1i('u_useTexture', 0);
        this.shader.setUniform4f('u_color', ...this.color);

        this.mesh.draw(posLoc, normLoc, texCoordLoc);
    }
}