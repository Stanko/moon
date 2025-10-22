import getDrawingData from './index';
import type { Options } from '../utils/options-type';

export default async function render(options: Options): Promise<SVGElement> {
  const { size: width, size: height } = options;

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

  console.log(data);

  // ----- Render ----- //
  console.time('svg render');
  // Add current URL with parameters into the SVG
  let svgContent = `\n<!-- ${window.location.href} -->\n`;

  const thresholds = {
    WHITE: 1,
    SILVER: 0.9,
    BRONZE: 0.7,
    GOLD: 0.6,
    GRAY: 0.55,
  };

  function getColor(value: number) {
    const colors = {
      gray: '#909090',
      gold: '#FFD700',
      bronze: '#cd9f72',
      silver: '#c0c0c0',
      white: '#ffffff',
    };

    // TODO add a control for it
    // Add some random colors in
    // if (random() > 0.95) {
    //   return colors.gold;
    // } else if (random() > 0.95) {
    //   return colors.bronze;
    // }

    if (value <= thresholds.GRAY) {
      return colors.gray;
    } else if (value <= thresholds.GOLD) {
      return colors.gold;
    } else if (value <= thresholds.BRONZE) {
      return colors.bronze;
    } else if (value <= thresholds.SILVER) {
      return colors.silver;
    } else {
      return colors.white;
    }
  }

  function getColorName(value: number) {
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

  const colorGroups: Record<
    string,
    {
      id: string;
      paths: string[];
    }
  > = {};

  data.forEach((circle) => {
    const color = getColor(circle.brightness);

    if (!colorGroups[color]) {
      colorGroups[color] = {
        id: getColorName(circle.brightness),
        paths: [],
      };
    }

    colorGroups[color].paths.push(
      `<path d="M ${circle.x} ${circle.y} Q ${circle.p2.x} ${circle.p2.y} ${circle.p3.x} ${circle.p3.y}"  />`,
    );
  });

  const stroke = 6;
  const strokeHalf = stroke / 2;
  const helper = 50;

  colorGroups[Object.keys(colorGroups)[0]].paths.push(
    `<path d="M ${width + strokeHalf} ${height + helper + strokeHalf} v -${helper} h ${helper}" fill="none" />`,
  );

  Object.keys(colorGroups).forEach((color) => {
    svgContent += `<g id="${colorGroups[color].id}"
      stroke-width="${stroke}"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="${color}"
    >${colorGroups[color].paths.join('\n')}</g>`;
  });

  svgElement.innerHTML = svgContent;
  console.timeEnd('svg render');

  return svgElement;
}
