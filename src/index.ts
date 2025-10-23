import render from './drawing/render';
import { downloadSVG } from './utils/download-svg';
import setTitle from './utils/set-title';
import { controls } from './controls';
import { decorateMoonInput } from './drawing/decorate-moon-input';

import '@stanko/ctrls/dist/ctrls.css';
import './scss/index.scss';

// Backup reference to the browser's Math.random method
export const originalRandom = Math.random;

// Get title from the HTML
const title = document.querySelector('title')?.textContent || '';

// UI elements
const drawingDiv = document.querySelector('.drawing') as HTMLDivElement;

const downloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg>`;

const buildUI = () => {
  const lastChild = controls.element.lastChild as HTMLElement;

  // Canvas wrapper
  const canvasWrapperControl = document.createElement('div');
  canvasWrapperControl.classList.add('ctrls__control');
  const canvasLabel = document.createElement('span');
  canvasLabel.classList.add('ctrls__control-label');
  canvasLabel.textContent = 'reference';
  canvasWrapperControl.appendChild(canvasLabel);
  const canvasWrapper = document.createElement('div');
  canvasWrapper.classList.add('canvas-wrapper');
  canvasWrapperControl.appendChild(canvasWrapper);

  // TODO
  // It would be nice to add a way to add elements to the controls div
  // and even group them together in one element with the randomize button
  const saveButton = document.createElement('button');
  saveButton.classList.add('controls-save', 'ctrls__btn', 'ctrls__btn--lg');
  saveButton.innerHTML = 'Save ' + downloadIcon;
  saveButton.addEventListener('click', () => {
    const svg = drawingDiv.querySelector('svg') as SVGElement;
    downloadSVG(svg, `drawing-${window.location.hash.replace('#/', '').replace(/(\/|,)/g, '_')}.svg`);
  });

  lastChild.insertBefore(canvasWrapperControl, lastChild.lastChild as HTMLElement);
  lastChild.appendChild(saveButton);

  // Add global keyboard shortcuts
  document.addEventListener('keypress', (e: KeyboardEvent) => {
    // Check if document.activeElement is not a text input
    const active = document.activeElement;
    const isTextInput = active instanceof HTMLInputElement && active.type === 'text';

    if (isTextInput) {
      return;
    }

    if (e.key === 'r') {
      e.preventDefault();
      controls.randomize();
    }
  });
};

const loader = document.createElement('div');
loader.classList.add('loader');
loader.innerHTML = 'Loading...';

const draw = async () => {
  const options = controls.getValues();

  // Swap random method for a seeded RNG
  Math.random = options.mainSeedRng;

  // Set unique favicon and title
  setTitle(options, title);

  drawingDiv.replaceChildren(loader);

  requestAnimationFrame(async () => {
    // Render the image
    const svg = await render(options);

    drawingDiv.replaceChildren(svg);
  });
};

// Redraw on options change
controls.onChange = draw;

// Initialize
buildUI();
decorateMoonInput();
draw();
