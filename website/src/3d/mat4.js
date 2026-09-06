export class Mat4 {
    /**
     * Create a new 4x4 matrix. Defaults to a 4x4 identity matrix if no data is provided.
     * @param {number[]|Float32Array|null} [array=null]
     */
    constructor(array = null) {
        this.data = array ? new Float32Array(array) : new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * @return {Mat4} A 4x4 identity matrix.
     */
    static identity() {
        return new Mat4();
    }

    /**
     * Multiplies this matrix with another.
     * @param {Mat4} other
     * @return {Mat4} The result of the multiplication.
     */
    multiply(other) {
        const thisData = this.data;
        const otherData = other.data;
        const result = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;

                for (let k = 0; k < 4; k++) {
                    // Move across the row by k.
                    const rowData = thisData[k * 4 + row];

                    // Move across the col by k.
                    const colData = otherData[col * 4 + k];

                    // Multiply and accumulate.
                    sum += rowData * colData;
                }

                result[col * 4 + row] = sum;
            }
        }

        return new Mat4(result);
    }

    /**
     * Translates (moves) this matrix by x, y and z.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Mat4}
     */
    translate(x, y, z) {
        const temp = new Mat4();

        temp.data[12] = x;	// The X-coordinate of the 4th column.
        temp.data[13] = y;	// The Y-coordinate of the 4th column.
        temp.data[14] = z;	// The Z-coordinate of the 4th column.

        return this.multiply(temp);
    }

    /**
     * Scales this matrix by x, y and z.
     * <p>
     *     The indices 0, 5 and 10 are chosen due to the fact that Float32Array is structured using column-major order, and the fact that scaling factors live along the diagonal.
     * </p>
     * <ul>
     *     <li>Index 0 is the first column on the first row.</li>
     *     <li>Index 5 is the second column on the second row.</li>
     *     <li>Index 10 is the third column on the third row.</li>
     * </ul>
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Mat4}
     */
    scale(x, y, z) {
        const temp = new Mat4();

        temp.data[0] = x;	// The X-coordinate of the 1st column.
        temp.data[5] = y;	// The Y-coordinate of the 2nd column.
        temp.data[10] = z;	// The Z-coordinate of the 3rd column.

        return this.multiply(temp);
    }

    /**
     * Rotates this matrix around the X-axis by a given angle in radians.
     * @param {number} angle
     * @return {Mat4}
     */
    rotateX(angle) {
        const temp = new Mat4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        temp.data[5] = c;	// The Y-coordinate of the second column.
        temp.data[6] = s;	// The Z-coordinate of the second column.
        temp.data[9] = -s;	// The Y-coordinate of the third column.
        temp.data[10] = c;	// The Z-coordinate of the third column.

        return this.multiply(temp);
    }

    /**
     * Rotates this matrix around the Y-axis by a given angle in radians.
     * @param {number} angle
     * @return {Mat4}
     */
    rotateY(angle) {
        const temp = new Mat4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        temp.data[0] = c;	// The X-coordinate of the 1st column.
        temp.data[2] = -s;	// The Z-coordinate of the 1st column.
        temp.data[8] = s;	// The X-coordinate of the 3rd column.
        temp.data[10] = c;	// The Z-coordinate of the 3rd column.

        return this.multiply(temp);
    }

    /**
     * Rotates this matrix around the Z-axis by a given angle in radians.
     * @param {number} angle
     * @return {Mat4}
     */
    rotateZ(angle) {
        const temp = new Mat4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        temp.data[0] = c;	// The X-coordinate of the 1st column.
        temp.data[1] = s;	// The Y-coordinate of the 1st column.
        temp.data[4] = -s;	// The X-coordinate of the 2nd column.
        temp.data[5] = c;	// The Y-coordinate of the 2nd column.

        return this.multiply(temp);
    }

    /**
     *
     * @param {number} fov Field of view, i.e. the "width" of the camera lens in radians.
     * @param {number} aspect Aspect ratio, the canvas' width divided by its height.
     * @param {number} near The closest distance the camera can see (for example 0.1). Anything else is clipped out.
     * @param {number} far The furthest distance the camera can see (for example 100.0). Anything else is clipped out.
     * @return {Mat4}
     */
    static perspective(fov, aspect, near, far) {
        /**
         * The cotangent of the half the field of view.
         * A smaller field of view means a higher focal length (like a telephoto zoom lens), while a wider field of view means a lower focal length (like a fish-eye lens).
         * @type {number}
         */
        const zoom = 1.0 / Math.tan(fov / 2);
        const result = new Float32Array(16);

        result[0] = zoom / aspect;						// X scaling - X is divided by aspect ratio to stretch it horizontally so it matches the monitor's proportions.
        result[5] = zoom;								// Y scaling - purely based on field of view.
        result[10] = (far + near) / (near - far); 		// Z scaling - remaps depth.
        result[11] = -1;								// Apparently this is a trick to squash everything into WebGL's coordinate range of [-1, 1] so things will work. That explanation is good enough for me!
        result[14] = (2 * far * near) / (near - far); 	// Z scaling - remaps deth.
        result[15] = 0;									// Apparently this is a trick to squash everything into WebGL's coordinate range of [-1, 1] so things will work. That explanation is good enough for me!

        return new Mat4(result);
    }
}