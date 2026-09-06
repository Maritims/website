/**
 * @param {number[]} rgb
 * @return {string}
 */
export function convertRgbToCss(rgb) {
    return `rgb(${Math.floor(rgb[0] * 255)}, ${Math.floor(rgb[1] * 255)}, ${Math.floor(rgb[2] * 255)})`;
}

/**
 * Uploads an HTML canvas as a WebGL 2D texture.
 * @param {WebGLRenderingContext} webglCtx
 * @param {HTMLCanvasElement} canvas
 */
export function createTextureFromCanvas(webglCtx, canvas) {
    const texture = webglCtx.createTexture();

    webglCtx.bindTexture(webglCtx.TEXTURE_2D, texture);
    webglCtx.texImage2D(webglCtx.TEXTURE_2D, 0, webglCtx.RGBA, webglCtx.RGBA, webglCtx.UNSIGNED_BYTE, canvas);
    webglCtx.texParameteri(webglCtx.TEXTURE_2D, webglCtx.TEXTURE_WRAP_S, webglCtx.CLAMP_TO_EDGE);
    webglCtx.texParameteri(webglCtx.TEXTURE_2D, webglCtx.TEXTURE_WRAP_T, webglCtx.CLAMP_TO_EDGE);
    webglCtx.texParameteri(webglCtx.TEXTURE_2D, webglCtx.TEXTURE_MIN_FILTER, webglCtx.LINEAR);
    webglCtx.texParameteri(webglCtx.TEXTURE_2D, webglCtx.TEXTURE_MAG_FILTER, webglCtx.LINEAR);

    return texture;
}

/**
 * Generates a generic text texture from an HTML canvas.
 * @param {WebGLRenderingContext} webglCtx
 * @param {string} text - The string of text to render.
 * @param {Object} [options] - Configuraton options for the canvas and text.
 * @param {number} [options.width=256] - Width of the texture canvas in pixels.
 * @param {number} [options.height=256] - Height of the texture canvas in pixels.
 * @param {string} [options.bgColor='#FFFFFF'] - CSS color for the canvas background.
 * @param {string} [options.textColor='#000000'] - CSS color for the text fill.
 * @param {string} [options.font='bold 24px sans-serif'] - Standard CSS font string.
 * @param {CanvasTextAlign} [options.textAlign='center']
 * @param {CanvasTextBaseline} [options.textBaseline='middle']
 * @param {number} [options.rotate=0] - Rotation angle in radians.
 * @param {number[]} [options.scale=[1, 1]] - 2D scale array [scaleX, scaleY] to flip or stretch the text.
 * @param {Function} [options.onDrawBackground] - Custom callback `(ctx, width, height)` executed after filling the background, ideal for drawing borders or patterns.
 */
export function createTextTexture(webglCtx, text, options = {}) {
    const width = options.width || 256;
    const height = options.height || 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = options.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (options.onDrawBackground) {
        options.onDrawBackground(ctx, width, height);
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);

    if (options.rotate) {
        ctx.rotate(options.rotate);
    }
    if (options.scale) {
        ctx.scale(options.scale[0], options.scale[1]);
    }

    ctx.fillStyle = options.textColor || '#000000';
    ctx.font = options.font || 'bold 24px sans-serif';
    ctx.textAlign = options.textAlign || 'center';
    ctx.textBaseline = options.textBaseline || 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();

    return createTextureFromCanvas(webglCtx, canvas);
}