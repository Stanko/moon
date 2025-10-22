import memoize from '../utils/memoize';
import { drawImageOnCanvas, getRectColor } from '../utils/color';
import { createNoise2D } from 'simplex-noise';
import PoissonDiskSampling from 'poisson-disk-sampling';
import type { Options } from '../utils/options-type';

type Line = {
  x: number;
  y: number;
  hex: string;
  angle: number;
  p2: {
    x: number;
    y: number;
  };
  p3: {
    x: number;
    y: number;
  };
  brightness: number;
  r: number;
  g: number;
  b: number;
};

type DrawingData = Line[];

async function getDrawingData(options: Options): Promise<DrawingData> {
  const {
    size: width,
    size: height,
    // mainSeedRng,
    noiseSeedRng,
    easingEasing: easingFn,
    // debug,
    moonPhase,
    noiseScale,
  } = options;

  const noise = createNoise2D(noiseSeedRng);

  // --------- Main logic

  const canvasData = await drawImageOnCanvas(`/images/${moonPhase}.jpg`, width, height);

  const canvasDiv = document.querySelector('.canvas-wrapper') as HTMLDivElement;
  canvasDiv.replaceChildren(canvasData.canvas);

  const MIN_DISTANCE = 5;

  let timer;

  console.time((timer = 'poisson'));
  const p = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: MIN_DISTANCE,
    maxDistance: MIN_DISTANCE * 10,
    tries: 40,
    distanceFunction: function ([x, y]) {
      const { brightness } = getRectColor(canvasData.ctx, x, y, MIN_DISTANCE);

      return easingFn(1 - brightness);
      // return Math.pow(1 - brightness, 2.7);
    },
  });

  const points = p.fill();
  console.timeEnd(timer);

  console.time((timer = 'colors'));
  const colors: Line[] = [];
  points.forEach(([x, y]) => {
    const colorData = getRectColor(canvasData.ctx, x, y, MIN_DISTANCE);

    if (colorData.brightness > 0.1) {
      const angle = noise(x / noiseScale, y / noiseScale) * Math.PI;
      const r = 3 * colorData.brightness * colorData.brightness * colorData.brightness;
      const p2 = { x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r };

      const angle2 = noise(p2.x / noiseScale, p2.y / noiseScale) * Math.PI;
      const p3 = { x: p2.x + Math.cos(angle2) * r, y: p2.y + Math.sin(angle2) * r };

      colors.push({
        ...colorData,
        x,
        y,
        r: 2,
        angle: noise(x / noiseScale, y / noiseScale) * Math.PI,
        p2,
        p3,
      });
    }
  });
  console.timeEnd(timer);

  return colors;
}

const memoizedGetDrawingData = memoize<Promise<DrawingData>>(
  getDrawingData as (options: unknown) => Promise<DrawingData>,
);

export default memoizedGetDrawingData;
