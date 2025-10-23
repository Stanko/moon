import getDrawingData from './index';
import type { Options } from '../utils/options-type';
import svgUtils from '../utils/svg-utils';

const thresholds = {
  WHITE: 1,
  SILVER: 0.9,
  BRONZE: 0.7,
  GOLD: 0.6,
  GRAY: 0.55,
};

// Numbers are used for plotting order
const colorMap = {
  '5-gray': '#909090',
  '4-gold': '#FFD700',
  '3-bronze': '#cd9f72',
  '2-silver': '#c0c0c0',
  '1-white': '#ffffff',
};

type LayerName = keyof typeof colorMap;

function getLayerName(value: number) {
  if (value <= thresholds.GRAY) {
    return '5-gray';
  } else if (value <= thresholds.GOLD) {
    return '4-gold';
  } else if (value <= thresholds.BRONZE) {
    return '3-bronze';
  } else if (value <= thresholds.SILVER) {
    return '2-silver';
  } else {
    return '1-white';
  }
}

export default async function render(options: Options): Promise<SVGElement> {
  const { size: width, size: height, lineWidth, plottingHelpers } = options;

  // ----- SVG init ----- //
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svgElement.setAttribute('preserveAspectRatio', 'none');

  // ----- Main logic ----- //

  // TODO add default memoization for "getDrawingData"
  console.time('drawing data');
  const data = await getDrawingData(options);
  console.timeEnd('drawing data');

  console.log(data.length + ' lines');

  // ----- Render ----- //
  console.time('svg render');
  // Add current URL with parameters into the SVG
  let svgContent = `\n<!-- ${window.location.href} -->\n`;

  const layers: Record<LayerName, string[]> = {
    '5-gray': [],
    '4-gold': [],
    '3-bronze': [],
    '2-silver': [],
    '1-white': [],
  };

  if (options.whiteOnly) {
    layers['1-white'] = data.map((line) => {
      return svgUtils.getPath(line.points, false);
    });
  } else {
    data.forEach((line) => {
      const layerName = getLayerName(line.brightness);

      layers[layerName].push(svgUtils.getPath(line.points, false));
    });
  }

  const stroke = lineWidth;
  const strokeHalf = stroke / 2;
  const helperLength = 5; // 5mm

  const keys = Object.keys(layers) as LayerName[];

  if (plottingHelpers) {
    // Push plotting helper to the first layer
    svgContent += `<g id="0-plotting-helpers" fill="none" stroke-width="1" stroke="rgb(255 0 255 / 0.5)">
        <rect
          width="${width}"
          height="${height}"
          x="0"
          y="0"
          vector-effect="non-scaling-stroke"
          fill="none"
          stroke-width="1"
        />
        <path
          d="M ${width + strokeHalf} ${height + helperLength + strokeHalf} v -${helperLength} h ${helperLength}"
          vector-effect="non-scaling-stroke"
        />
    </g>`;
  }

  keys.forEach((layerName) => {
    svgContent += `<g id="${layerName}"
      stroke-width="${stroke}"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      stroke="${colorMap[layerName]}"
    >
      ${layers[layerName].join('\n')}
    </g>`;
  });

  svgElement.innerHTML = svgContent;
  console.timeEnd('svg render');

  return svgElement;
}
