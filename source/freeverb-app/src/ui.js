import noUiSlider from 'nouislider';
import './nouislider.css';

export const init = (defaults, {onUnmuteClick, onRoomSizeUpdate, onDampeningUpdate, onWetUpdate, onDryUpdate}) => {
  const roomSizeSlider = document.getElementById('roomSize');
  noUiSlider.create(roomSizeSlider, {
    start: [defaults.roomSize],
    range: {
      min: 0,
      max: 1
    },
    step: 0.05,
    tooltips: true,
  });

  roomSizeSlider.noUiSlider.on('update', ([value]) => {
    onRoomSizeUpdate(Number(value));
  });

  const dampeningSlider = document.getElementById('dampening');

  noUiSlider.create(dampeningSlider, {
    start: [defaults.dampening],
    range: {
      min: 100,
      max: 5000
    },
    step: 100,
    tooltips: true,
    format: {to: Math.ceil, from:  Math.ceil}
  });

  dampeningSlider.noUiSlider.on('update', ([value]) => {
    onDampeningUpdate(Number(value));
  });

  const wetSlider = document.getElementById('wet');

  noUiSlider.create(wetSlider, {
    start: [defaults.wetGain],
    range: {
      min: 0,
      max: 1
    },
    step: 0.1,
    tooltips: true
  });

  wetSlider.noUiSlider.on('update', ([value]) => {
    onWetUpdate(Number(value));
  });

  const drySlider = document.getElementById('dry');

  noUiSlider.create(drySlider, {
    start: [defaults.dryGain],
    range: {
      min: 0,
      max: 1
    },
    step: 0.1,
    tooltips: true
  });

  drySlider.noUiSlider.on('update', ([value]) => {
    onDryUpdate(Number(value));
  });

  const unmuteButton = document.getElementById('unmute');
  unmuteButton.addEventListener('click', onUnmuteClick);
};
