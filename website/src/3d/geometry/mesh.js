export class Mesh {
    /**
     * @param {WebGLRenderingContext} ctx The WebGL context.
     * @param {number[]|Float32Array} vertices Raw vertex data.
     * @param {number[]|Uint16Array} indices Triangle definitions.
     */
    constructor(ctx, vertices, indices) {
        this.ctx = ctx;
        this.numberOfIndices = indices.length;

        this.vertexBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW);

        this.indexBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), ctx.STATIC_DRAW);
    }

    /**
     * @param {number} positionLocation
     * @param {number} normalLocation
     * @param {number} texCoordLocation
     */
    draw(positionLocation, normalLocation, texCoordLocation) {
        const ctx = this.ctx;
        const stride = 8 * Float32Array.BYTES_PER_ELEMENT; // 8 floats per vertex (3 pos, 3 normal, 2 UV)

        ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);

        // 1. Position attribute (3 floats)
        ctx.enableVertexAttribArray(positionLocation);
        ctx.vertexAttribPointer(
            positionLocation,
            3,
            ctx.FLOAT,
            false,
            stride,
            0
        );

        // 2. Normal attribute (3 floats, offset by 3)
        ctx.enableVertexAttribArray(normalLocation);
        ctx.vertexAttribPointer(
            normalLocation,
            3,
            ctx.FLOAT,
            false,
            stride,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        // 3. Texture Coordinate attribute (2 floats, offset by 6)
        ctx.enableVertexAttribArray(texCoordLocation);
        ctx.vertexAttribPointer(
            texCoordLocation,
            2,
            ctx.FLOAT,
            false,
            stride,
            6 * Float32Array.BYTES_PER_ELEMENT
        );

        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        ctx.drawElements(ctx.TRIANGLES, this.numberOfIndices, ctx.UNSIGNED_SHORT, 0);
    }
}