export type ColorType = {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
  brightness: number; // 0 - 1
  hex: string;
};

function componentToHex(c: number): string {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getRectColor(ctx: CanvasRenderingContext2D, x: number, y: number, rectWidth: number = 1): ColorType {
  const offset = Math.floor(rectWidth / 2);
  rectWidth = Math.max(rectWidth, 1);
  const imageData = ctx.getImageData(x - offset, y - offset, rectWidth, rectWidth);

  let r = 0;
  let g = 0;
  let b = 0;

  for (let k = 0; k < imageData.data.length; k += 4) {
    r += imageData.data[k];
    g += imageData.data[k + 1];
    b += imageData.data[k + 2];
  }

  const n = rectWidth * rectWidth;

  // ctx.strokeStyle = '#888';
  // ctx.rect(x, y, rectWidth, rectWidth);
  // ctx.stroke();

  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);

  return {
    r,
    g,
    b,
    // Formula for relative brightness
    brightness: (0.299 * r + 0.587 * g + 0.114 * b) / 255,
    hex: rgbToHex(r, g, b),
  };
}

export type CanvasData = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export function drawImageOnCanvas(imageSrc: string, canvasWidth: number, canvasHeight: number): Promise<CanvasData> {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d', {
    // This option will save memory on frequent getImageData calls Vertigo is making
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;

  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener('load', () => {
      const canvasRatio = canvasWidth / canvasHeight;
      const imageRatio = image.width / image.height;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawHeight = canvasWidth / imageRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imageRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      // Draw the image on the canvas with the calculated dimensions and position
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      resolve({ canvas, ctx });
    });

    // Load image
    image.src = imageSrc;
  });
}

export function onFileChange(input: HTMLInputElement, callback: (fileURL: string | null) => any) {
  // On file input change get the file URL
  input.addEventListener('change', () => {
    if (input.files) {
      const file: File = input.files[0];
      const imageURL = URL.createObjectURL(file);

      callback(imageURL);
    } else {
      callback(null);
    }
  });
}
