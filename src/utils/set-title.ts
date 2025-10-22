import random from './random';
import type { Options } from './options-type';
import Alea from './alea';

const getIcon = (dark: string, light: string, phase: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = light;

  console.log(light, dark);

  const map: Record<number, { x: number; y: number; bg: string; fg: string }> = {
    1: {
      x: 12,
      y: -2,
      bg: light,
      fg: dark,
    },
    2: {
      x: -16,
      y: 2,
      bg: dark,
      fg: light,
    },
    4: {
      x: 16,
      y: 2,
      bg: dark,
      fg: light,
    },
    5: {
      x: -12,
      y: -4,
      bg: light,
      fg: dark,
    },
  };

  const settings = map[phase] || {
    x: 0,
    y: 0,
    bg: dark,
    fg: light,
  };

  const cx = 32;
  const cy = 32;
  const r = 32;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = settings.bg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.beginPath();
  ctx.arc(cx + settings.x, cy + settings.y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = settings.fg;
  ctx.fill();

  return canvas.toDataURL();
};

const setTitle = (options: Options, title = '') => {
  if (title) {
    title += ' • ';
  }

  const rng = Alea(JSON.stringify(options));
  const h = random(0, 360, rng, 0).toString();

  const color = `oklch(0.7 0.3 ${h})`;
  const darkColor = `oklch(0.3 0.3 ${h})`;
  const icon = getIcon(darkColor, color, options.moonPhase);

  console.log('%c  ', `background: ${color}`, options.mainSeed);

  const iconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

  // Probably should be removed
  // Testing colors for now
  const controlsElement = document.querySelector('.ctrls') as HTMLElement;
  controlsElement.style.setProperty('--ctrls-h', h);

  iconElement.setAttribute('href', icon);

  document.title = title + options.mainSeed;
};

export default setTitle;
