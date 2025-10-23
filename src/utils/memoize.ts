import mem from 'mem';
import type { Options } from './options-type';

export default function memoize<T>(fn: (...args: unknown[]) => T) {
  return mem(fn, {
    cacheKey: (args) => {
      const options = args[0] as Options & { imageURL: string };

      return [
        options.size,
        options.minDistance,
        options.pointsPerLine,
        options.segmentLength,
        options.moonPhase,
        options.noiseScale,
        options.noiseSeed,
        options.mainSeed,
        options.easing,
        options.lineWidth,
        options.imageURL || '',
      ]
        .map((item) => item.toString())
        .join('_');
    },
  });
}
