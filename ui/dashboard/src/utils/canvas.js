export const clipDrawedArea = canvas => {
    var ctx = canvas.getContext("2d");
    var w = canvas.width,
        h = canvas.height,
        pix = { x: [], y: [] },
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        x,
        y,
        index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index + 3] > 0) {
                pix.x.push(x);
                pix.y.push(y);
            }
        }
    }
    pix.x.sort(function (a, b) {
        return a - b;
    });
    pix.y.sort(function (a, b) {
        return a - b;
    });
    var n = pix.x.length - 1;

    x = pix.x[0]
    y = pix.y[0]
    w = 1 + pix.x[n] - x;
    h = 1 + pix.y[n] - y;
    if (isNaN(w) && isNaN(h)) {
        return;
    } else {
        return {
            x, y, w, h,
            original: {
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                x, y, w, h
            }
        }
    }
}

export const cropImageFromCanvas = (canvas) => {
    const position = clipDrawedArea(canvas)
    if (!position) {
        return;
    }
    const { x, y, w, h } = position;
    var ctx = canvas.getContext("2d");
    var cut = ctx.getImageData(x, y, w, h);

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    tmpCanvas.getContext('2d').putImageData(cut, 0, 0);

    const image = tmpCanvas.toDataURL();
    return {
        src: image,
        ...position
    };
};