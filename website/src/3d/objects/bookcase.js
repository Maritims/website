import {Mat4} from "../math/mat4.js";

export class Bookcase {
    /**
     * @param {WebGLRenderingContext} ctx
     * @param {number} width - Width of the book case.
     * @param {number} height - Height of the book case.
     * @param {number} depth - Depth of the book case.
     * @param {number} thickness - Thickness of the book case's boards.
     * @param {number} shelfCount - Total number of horizontal shelves.
     * @param {ShaderProgram} shader
     * @param {CubeMesh} mesh
     */
    constructor(ctx, width, height, depth, thickness, shelfCount, shader, mesh) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.thickness = thickness;
        this.shelfCount = shelfCount;
        this.shader = shader;
        this.mesh = mesh;

        this.woodColor = [139 / 255, 69 / 255, 19 / 255, 1.0];
        this.shelves = Array.from({length: shelfCount}, () => []);

        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    getModelMatrix() {
        return new Mat4().translate(this.x, this.y, this.z);
    }

    getShelfSurfaceY(shelfIndex) {
        const innerBottomY = this.thickness;
        const innerTopY = this.height - this.thickness;
        const innerHeight = innerTopY - innerBottomY;
        const spacing = innerHeight / this.shelfCount;

        return innerBottomY + (shelfIndex * spacing);
    }

    getInternalShelfY(shelfIndex) {
        const surfaceY = this.getShelfSurfaceY(shelfIndex);
        return surfaceY - (this.thickness / 2);
    }

    addBookToShelf(shelfIndex, book) {
        if (!this.shelves[shelfIndex]) {
            console.warn(`Shelf index ${shelfIndex} does not exist.`);
            return false;
        }

        const shelfSurfaceY = this.getShelfSurfaceY(shelfIndex);

        const isBelowTopShelf = shelfIndex < this.shelfCount - 1;
        const ceilingY = (isBelowTopShelf ? this.getShelfSurfaceY(shelfIndex + 1) : this.height) - this.thickness;
        const headroom = ceilingY - shelfSurfaceY;
        if (book.height > headroom) {
            console.warn(`The book is too tall! Height: ${book.height}, available headroom: ${headroom.toFixed(2)}`);
            return false;
        }

        const leftPadding = 0.15;
        const rightPadding = 0.15;
        const usableWidth = this.width - (leftPadding + rightPadding);

        let currentWidth = 0;
        const books = this.shelves[shelfIndex];
        for (const existingBook of books) {
            currentWidth += existingBook.width + 0.02;
        }
        currentWidth += book.width;

        if (currentWidth > usableWidth) {
            console.warn(`Shelf ${shelfIndex} is full. No room horizontally.`);
            return false;
        }

        this.shelves[shelfIndex].push(book);
        this.layoutShelf(shelfIndex);
        return true;
    }

    layoutShelf(shelfIndex) {
        /** @type {Book[]} */
        const books = this.shelves[shelfIndex];

        // Start right next to the inner left wall (Left panel center - half thickness + small 1cm gap)
        const leftInnerWall = -this.width / 2 + (this.thickness / 2);
        let currentX = leftInnerWall + 0.01;

        const shelfSurfaceY = this.getShelfSurfaceY(shelfIndex);

        for (const book of books) {
            const bookCenterY = shelfSurfaceY + (book.height / 2);
            const bookCenterX = currentX + (book.width / 2);
            const shelfFrontEdge = this.depth / 2;
            const bookZ = shelfFrontEdge - (book.depth / 2);

            // Position X along the shelf, Y on top of the shelf, and Z pushed forward to the front edge
            book.setPosition(bookCenterX, bookCenterY, bookZ);

            currentX += book.width + 0.02;
        }
    }

    /**
     * Renders the entire bookcase frame and all its books.
     * @param {WebGLRenderingContext} webglCtx
     * @param {ShaderProgram} shader
     * @param {Mat4} viewProjectionMatrix
     */
    render(webglCtx, shader, viewProjectionMatrix) {
        this.shader.use();

        const posLoc = shader.getAttributeLocation('a_position');
        const normLoc = shader.getAttributeLocation('a_normal');
        const texCoordLoc = shader.getAttributeLocation('a_texCoord'); // <--- Added here

        const bookcaseModelMatrix = this.getModelMatrix();

        const drawPart = (offsetX, offsetY, scaleX, scaleY, scaleZ) => {
            const matrix = viewProjectionMatrix
                .translate(offsetX, offsetY, 0)
                .scale(scaleX, scaleY, scaleZ);

            this.shader.setUniformMatrix4fv('u_matrix', matrix);
            this.shader.setUniform1i('u_useTexture', 0); // Wood frame uses solid color
            this.shader.setUniform4f('u_color', ...this.woodColor);

            this.mesh.draw(posLoc, normLoc, texCoordLoc);
        };

        // 1. Outer Frame
        drawPart(-this.width / 2, this.height / 2, this.thickness, this.height, this.depth);
        drawPart(this.width / 2, this.height / 2, this.thickness, this.height, this.depth);
        drawPart(0, this.thickness / 2, this.width, this.thickness, this.depth);
        drawPart(0, this.height - this.thickness / 2, this.width, this.thickness, this.depth);

        // 2. Internal Divider Shelves
        for (let i = 1; i < this.shelfCount; i++) {
            drawPart(0, this.getInternalShelfY(i), this.width, this.thickness, this.depth);
        }

        // 3. Draw Books
        for (let i = 0; i < this.shelves.length; i++) {
            for (const book of this.shelves[i]) {
                const bookMvp = viewProjectionMatrix
                    .multiply(bookcaseModelMatrix)
                    .multiply(book.getModelMatrix());

                this.shader.setUniformMatrix4fv('u_matrix', bookMvp);

                if (book._texture) {
                    this.shader.setUniform1i('u_useTexture', 1);
                    this.shader.setUniform1i('u_texture', 0); // <--- Tell shader to sample from texture unit 0
                    this.ctx.activeTexture(this.ctx.TEXTURE0);       // <--- Activate texture unit 0
                    this.ctx.bindTexture(this.ctx.TEXTURE_2D, book._texture);
                } else {
                    this.shader.setUniform1i('u_useTexture', 0);
                    this.shader.setUniform4f('u_color', ...book._color);
                }

                this.mesh.draw(posLoc, normLoc, texCoordLoc);
            }
        }
    }
}