import {Mesh} from "./mesh.js";
import {GeometryBuilder} from "./geometry-builder.js";

export class CubeMesh extends Mesh {
    /**
     * @param {WebGLRenderingContext} ctx
     * @param {number} vMin
     * @param {number} vMax
     */
    constructor(ctx, vMin = 0.0, vMax = 1.0) {
        const h = 0.5;

        const meshData = new GeometryBuilder()
            .addQuad([-h, -h,  h], [ h, -h,  h], [ h,  h,  h], [-h,  h,  h], [0, 0, 1],   [0.0, vMin, 1.0, vMin, 1.0, vMax, 0.0, vMax]) // Front (Spine)
            .addQuad([-h, -h, -h], [ h, -h, -h], [ h,  h, -h], [-h,  h, -h], [0, 0, -1])  // Back (Corrected order)
            .addQuad([-h,  h, -h], [-h,  h,  h], [ h,  h,  h], [ h,  h, -h], [0, 1, 0])   // Top
            .addQuad([-h, -h, -h], [ h, -h, -h], [ h, -h,  h], [-h, -h,  h], [0, -1, 0])  // Bottom
            .addQuad([ h, -h, -h], [ h,  h, -h], [ h,  h,  h], [ h, -h,  h], [1, 0, 0])   // Right
            .addQuad([-h, -h, -h], [-h, -h,  h], [-h,  h,  h], [-h,  h, -h], [-1, 0, 0])  // Left
            .build();

        super(ctx, meshData.vertices, meshData.indices);
    }
}