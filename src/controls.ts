import { config } from './drawing/options-config';
import { Ctrls } from '@stanko/ctrls';

const controlsDiv = document.querySelector('.controls') as HTMLDivElement;

export const controls = new Ctrls(config, {
  title: 'Moon Phases',
  parent: controlsDiv,
});
