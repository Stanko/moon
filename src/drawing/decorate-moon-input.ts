import { controls } from '..';
import { moonPhaseIcons } from '../utils/moon-phase-icons';

export const decorateMoonInput = () => {
  const wrapper = document.querySelectorAll('.ctrls__control--range')[1] as HTMLLabelElement;
  wrapper.classList.add('moon-control');
  const right = wrapper.querySelector('.ctrls__control-right') as HTMLDivElement;
  const input = wrapper.querySelector('.ctrls__range-input') as HTMLInputElement;

  const phasesWrapper = document.createElement('div');
  phasesWrapper.classList.add('moon-control__phases-wrapper');

  const phases = document.createElement('div');
  phases.classList.add('moon-control__phases');
  phases.innerHTML = moonPhaseIcons.join('');

  phasesWrapper.appendChild(phases);

  right.appendChild(phasesWrapper);

  const values = controls.getValues();
  input.setAttribute('value', values.moonPhase.toString());

  controls.onInput = () => {
    const values = controls.getValues();
    input.setAttribute('value', values.moonPhase.toString());
  };
};
