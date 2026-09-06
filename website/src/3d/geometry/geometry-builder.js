export class GeometryBuilder {
    constructor() {
        this.vertices = [];
        this.indices = [];
        this._vertexIndex = 0;
    }

    /**
     * Adds a quad (two triangles forming a face).
     * @param {number[]} bottomLeft - Bottom-left corner [x, y, z].
     * @param {number[]} bottomRight - Bottom-right corner [x, y, z].
     * @param {number[]} topRight - Top-right corner [x, y, z].
     * @param {number[]} topLeft - Top-left corner [x, y, z].
     * @param {number[]} normal - Face normal [nx, ny, nz].
     * @param {number[]} uvs
     * @return {GeometryBuilder}
     */
    addQuad(bottomLeft, bottomRight, topRight, topLeft, normal, uvs = [0, 0,  1, 0,  1, 1,  0, 1]) {
        const startIndex = this._vertexIndex;

        this.vertices.push(...bottomLeft, ...normal, uvs[0], uvs[1]);
        this.vertices.push(...bottomRight, ...normal, uvs[2], uvs[3]);
        this.vertices.push(...topRight, ...normal, uvs[4], uvs[5]);
        this.vertices.push(...topLeft, ...normal, uvs[6], uvs[7]);

        this.indices.push(
            startIndex, startIndex + 1, startIndex + 2,
            startIndex, startIndex + 2, startIndex + 3
        );

        this._vertexIndex += 4;

        return this;
    }

    build() {
        return {
            vertices: new Float32Array(this.vertices),
            indices: new Uint16Array(this.indices)
        }
    }
}