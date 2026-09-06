import {convertRgbToCss, createTextTexture} from "./texture.js";
import {Mat4} from "./mat4.js";

export class Book {
    /**
     * @param {string} title
     * @param {number} width
     * @param {number} height
     * @param {number} depth
     * @param {number[]} color - [red, green, blue, alpha]
     */
    constructor(title, width, height, depth, color) {
        this._title = title;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this._color = color;

        // The book's own location position relative to its container.
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    get title() {
        return this._title;
    }

    get color() {
        return this._color;
    }

    set texture(texture) {
        this._texture = texture;
    }

    /**
     * Sets the location position of the book.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Book}
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Computes the book's local model matrix.
     * @return {Mat4}
     */
    getModelMatrix() {
        return new Mat4().translate(this.x, this.y, this.z).scale(this.width, this.height, this.depth);
    }

    /**
     * @param {WebGLRenderingContext} webglCtx
     * @param {WebGLProgram} shaderProgram
     * @param {Mesh} cubeMesh
     */
    render(webglCtx, shaderProgram, cubeMesh) {
        const uModelMatrix = webglCtx.getUniformLocation(shaderProgram, 'uModelMatrix');
        const uColor = webglCtx.getUniformLocation(shaderProgram, 'uColor');
        const uSampler = webglCtx.getUniformLocation(shaderProgram, 'uSampler');

        webglCtx.uniformMatrix4fv(uModelMatrix, false, this.getModelMatrix().data);
        webglCtx.uniform3fv(uColor, this.color);

        if (this.texture) {
            webglCtx.activeTexture(webglCtx.TEXTURE0);
            webglCtx.bindTexture(webglCtx.TEXTURE_2D, this._texture);
            webglCtx.uniform1i(uSampler, 0);
        }

        const positionLocation = webglCtx.getAttribLocation(shaderProgram, 'aPosition');
        const normalLocation = webglCtx.getAttribLocation(shaderProgram, 'aNormal');
        const texCoordLocation = webglCtx.getAttribLocation(shaderProgram, 'aTexCoord');

        cubeMesh.draw(positionLocation, normalLocation, texCoordLocation);
    }
}

/**
 * Builds a book and handles its texture allocation.
 * @param {WebGLRenderingContext} webglCtx
 * @param {string} title - The title of the book.
 * @param {number[]} color - The color of the book in RGBA.
 * @param {number} width - The width of the book in centimeters.
 * @param {number} height - The height of the book in centimeters.
 * @param {number} depth - The depth of the book in centimeters.
 * @return {Book}
 */
export function createBook(webglCtx, title, width, height, depth, color) {
    const book = new Book(title, width / 100.0, height / 100.0, depth / 100.0, color);
    book.texture = createTextTexture(webglCtx, book.title, {
        width: 128,
        height: 512,
        bgColor: convertRgbToCss(book.color),
        textColor: '#FFFFFF',
        font: 'bold 28px sans-serif',
        rotate: -Math.PI / 2,
        scale: [1, -1],
        onDrawBackground: (ctx, w, h) => {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, w - 20, h - 20);
        }
    });
    return book;
}