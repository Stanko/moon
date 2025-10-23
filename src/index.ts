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
const clearIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 3 3 L 21 21 M 21 3 L 3 21"></path></svg>`;

const fileInput = document.createElement('input');

const buildUI = () => {
  const controlsContainer = controls.element.lastChild as HTMLElement;

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

  // File input
  const fileControl = document.createElement('div');
  fileControl.classList.add('ctrls__control', 'file-control');

  const fileLabel = document.createElement('label');
  fileLabel.classList.add('ctrls__control-label');
  fileLabel.textContent = 'custom image';
  fileLabel.setAttribute('for', 'file-input');

  const fileRight = document.createElement('div');
  fileRight.classList.add('file-control__right');

  fileInput.setAttribute('type', 'file');
  fileInput.setAttribute('id', 'file-input');
  fileInput.setAttribute('accept', 'image/*');
  fileInput.classList.add('file-control__input');
  fileInput.addEventListener('change', () => {
    draw();
  });

  const fileFakeInput = document.createElement('label');
  fileFakeInput.classList.add('file-control__fake-input', 'ctrls__btn', 'ctrls__btn--lg');
  fileFakeInput.setAttribute('for', 'file-input');
  fileFakeInput.textContent = 'Choose file';

  const fileClear = document.createElement('button');
  fileClear.classList.add('file-control__clear', 'ctrls__btn', 'ctrls__seed-new-button');
  fileClear.innerHTML = clearIcon;
  fileClear.addEventListener('click', () => {
    if (fileInput.files?.[0]) {
      fileInput.value = '';
      draw();
    }
  });

  fileRight.append(fileInput);
  fileRight.append(fileFakeInput);
  fileRight.append(fileClear);

  fileControl.appendChild(fileLabel);
  fileControl.appendChild(fileRight);

  // TODO
  // It would be nice to add a way to add elements to the controls div
  // and even group them together in one element with the randomize button
  const saveButton = document.createElement('button');
  saveButton.classList.add('controls-save', 'ctrls__btn', 'ctrls__btn--lg');
  saveButton.innerHTML = 'Save ' + downloadIcon;
  saveButton.addEventListener('click', () => {
    const svg = drawingDiv.querySelector('svg') as SVGElement;
    downloadSVG(
      svg,
      `drawing-${window.location.hash.replace('#/', '').replace(/(\/|,)/g, '_')}.svg`,
    );
  });

  controlsContainer.insertBefore(canvasWrapperControl, controlsContainer.lastChild as HTMLElement);
  controlsContainer.insertBefore(fileControl, controlsContainer.lastChild as HTMLElement);
  controlsContainer.appendChild(saveButton);

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
    const file = fileInput.files?.[0];
    const imageURL = file ? URL.createObjectURL(file) : '';
    const svg = await render(options, imageURL);

    drawingDiv.replaceChildren(svg);
  });
};

// Redraw on options change
controls.onChange = () => draw();
controls.onInput = (values) => {
  // Clear input if moon phase is updated
  if (values.moonPhase) {
    fileInput.value = '';
  }
};

// Initialize
buildUI();
decorateMoonInput();
draw();

// Goatcounter
if (import.meta.env.PROD) {
  const gc = document.createElement('script');
  gc.setAttribute('data-goatcounter', 'https://muffinman_io.goatcounter.com/count');
  gc.setAttribute('async', '');
  gc.src = '//gc.zgo.at/count.js';

  document.body.appendChild(gc);
}
