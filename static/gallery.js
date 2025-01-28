(function () {
    /**
     * @type {HTMLDialogElement}
     */
    const dialog = document.getElementById('closeup');
    /**
     * @type {HTMLDivElement}
     */
    const dialogBody = dialog.querySelector('.dialog-body');

    dialog.addEventListener('close', () => {
        dialogBody.innerHTML = '';
    });

    dialog.querySelector('.close').addEventListener('click', (event) => dialog.close());

    document.querySelectorAll('#the-gallery > article > figure > .image-container > img').forEach(originalImageElement => {
        originalImageElement.addEventListener('click', (event) => {
            const originalFigureElement = originalImageElement.closest('figure');
            const originalFigcaptionElement = originalFigureElement.querySelector('figcaption');

            const newFigureElement = document.createElement('figure');
            const newImageElement = Object.assign(document.createElement('img'), { src: originalImageElement.src });
            const newFigcaptionElement = Object.assign(document.createElement('figcaption'), { innerHTML: originalFigcaptionElement.innerHTML });
            newFigureElement.appendChild(newImageElement);
            newFigureElement.appendChild(newFigcaptionElement);

            dialogBody.appendChild(newFigureElement);
            dialog.showModal();
        });
    });
})();