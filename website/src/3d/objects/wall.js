import { Mat4 } from "../math/mat4.js";

export class Wall {
    /**
     * @param {WebGLRenderingContext} ctx
     * @param {number} width - Width of the wall
     * @param {number} height - Height of the wall
     * @param {ShaderProgram} shader
     * @param {PlaneMesh} planeGeometry
     * @param {number[]} color
     */
    constructor(ctx, width, height, shader, planeGeometry, color) {
        this.shader = shader;
        this.mesh = planeGeometry;
        this.color = color || [0.18, 0.15, 0.12, 1.0]; // Dark moody wall tone

        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    render(ctx, shaderProgram, viewProjectionMatrix) {
        this.shader.use();

        const posLoc = this.shader.getAttributeLocation('a_position');
        const normLoc = this.shader.getAttributeLocation('a_normal');
        const texCoordLoc = this.shader.getAttributeLocation('a_texCoord');

        // Rotate the horizontal plane 90 degrees around the X-axis to make it vertical,
        // then scale it to match the requested width and height.
        const centerY = this.y + (this.height / 2);

        const modelMatrix = new Mat4()
            .translate(this.x, centerY, this.z)
            .rotateX(Math.PI / 2)
            .scale(this.width, 1.0, this.height);

        const mvp = viewProjectionMatrix.multiply(modelMatrix);

        this.shader.setUniformMatrix4fv('u_matrix', mvp);
        this.shader.setUniform1i('u_useTexture', 0);
        this.shader.setUniform4f('u_color', ...this.color);

        this.mesh.draw(posLoc, normLoc, texCoordLoc);
    }
}