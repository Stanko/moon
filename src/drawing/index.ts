import memoize from '../utils/memoize';
import { drawImageOnCanvas, getRectColor, type CanvasData } from '../utils/color';
import { createNoise2D } from 'simplex-noise';
import PoissonDiskSampling from 'poisson-disk-sampling';
import type { Options } from '../utils/options-type';

type Line = {
  hex: string;
  angle: number;
  brightness: number;
  r: number;
  g: number;
  b: number;
  points: {
    x: number;
    y: number;
  }[];
};

type DrawingData = Line[];

function getLines(options: Options, canvasData: CanvasData): DrawingData {
  const {
    size,
    noiseSeedRng,
    easingEasing,
    noiseScale,
    minDistance,
    pointsPerLine,
    segmentLength,
  } = options;

  const noise = createNoise2D(noiseSeedRng);

  let timer;

  // ----- POISSON ----- //

  console.time((timer = 'poisson'));
  const p = new PoissonDiskSampling({
    shape: [size, size],
    minDistance: minDistance,
    maxDistance: minDistance * 10,
    tries: 40,
    distanceFunction: function ([x, y]) {
      const { brightness } = getRectColor(canvasData.ctx, x, y, minDistance);

      return easingEasing(1 - brightness);
    },
  });

  const points = p.fill();
  console.timeEnd(timer);

  // ----- LINES ----- //

  console.time((timer = 'lines'));
  const lines: Line[] = [];
  points.forEach(([x, y]) => {
    const colorData = getRectColor(canvasData.ctx, x, y, minDistance);

    if (colorData.brightness > 0.1) {
      const points = [{ x, y }];

      if (pointsPerLine > 1) {
        for (let i = 0; i < pointsPerLine; i++) {
          const last = points[points.length - 1];
          const { x, y } = last;
          const angle = noise(x / noiseScale, y / noiseScale) * Math.PI;
          const r = segmentLength * Math.pow(colorData.brightness, 3);
          const p = { x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r };
          points.push(p);
        }
      } else {
        points.push({ x, y: y + 0.01 });
      }

      lines.push({
        ...colorData,
        points,
        r: 2,
        angle: noise(x / noiseScale, y / noiseScale) * Math.PI,
      });
    }
  });
  console.timeEnd(timer);

  return lines;
}

const memoizedCalculate = memoize<DrawingData>(
  getLines as (options: unknown, canvasData: unknown) => DrawingData,
);

export default async function getDrawingData(
  options: Options,
  imageURL?: string,
): Promise<DrawingData> {
  const { size, moonPhase } = options;

  // --------- Main logic

  const canvasData = await drawImageOnCanvas(imageURL || `./images/${moonPhase}.jpg`, size, size);
  const canvasDiv = document.querySelector('.canvas-wrapper') as HTMLDivElement;
  canvasDiv.replaceChildren(canvasData.canvas);

  return memoizedCalculate({ ...options, imageURL }, canvasData);
}
