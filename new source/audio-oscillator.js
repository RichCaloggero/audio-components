// audio-oscillator.js
// Native Web Component for oscillator node
// Replaces Polymer-based AudioOscillator

import { AudioComponentBase, statusMessage, not } from "./audio-component-base.js";
import { Oscillator } from "./audio-component.js";

let instanceCount = 0;

class AudioOscillator extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'type', 'frequency', 'detune', 'play', 'min', 'max', 'step'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-oscillator-${instanceCount}`;

		// Oscillator-specific properties
		this._type = 'sine';
		this._frequency = 440;
		this._detune = 0;
		this._play = false;
		this._min = 0;
		this._max = 20000;
		this._step = 10;

		this.options = { type: '', frequency: 0, detune: 0 };
		this.component = new Oscillator(this.audio);
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-oscillator">
				<legend><h2>${this._label}</h2></legend>

				<ui-list label="type" values='["sine", "square", "sawtooth", "triangle"]'></ui-list>
				<ui-number label="frequency" min="${this._min}" max="${this._max}" step="${this._step}"></ui-number>
				<ui-number label="detune" min="0.0" max="100.0" step="1.0"></ui-number>
				<ui-boolean label="play"></ui-boolean>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	}

	_setupEventListeners() {
		// Type control
		const typeEl = this.shadowRoot.querySelector('ui-list[label="type"]');
		if (typeEl) {
			typeEl.value = this._type;
			typeEl.addEventListener('value-changed', (e) => {
				this._type = e.detail.value;
				this._updateOscillator();
			});
		}

		// Frequency control
		const freqEl = this.shadowRoot.querySelector('ui-number[label="frequency"]');
		if (freqEl) {
			freqEl.value = this._frequency;
			freqEl.addEventListener('value-changed', (e) => {
				this._frequency = e.detail.value;
				this._updateOscillator();
			});
		}

		// Detune control
		const detuneEl = this.shadowRoot.querySelector('ui-number[label="detune"]');
		if (detuneEl) {
			detuneEl.value = this._detune;
			detuneEl.addEventListener('value-changed', (e) => {
				this._detune = e.detail.value;
				this._updateOscillator();
			});
		}

		// Play control
		const playEl = this.shadowRoot.querySelector('ui-boolean[label="play"]');
		if (playEl) {
			playEl.value = this._play;
			playEl.addEventListener('value-changed', (e) => {
				this.play = e.detail.value;
			});
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'type':
				this._type = newValue || 'sine';
				this._updateOscillator();
				break;
			case 'frequency':
				this._frequency = Number(newValue) || 440;
				this._updateOscillator();
				break;
			case 'detune':
				this._detune = Number(newValue) || 0;
				this._updateOscillator();
				break;
			case 'play':
				this.play = newValue !== null;
				break;
			case 'min':
				this._min = Number(newValue) || 0;
				break;
			case 'max':
				this._max = Number(newValue) || 20000;
				break;
			case 'step':
				this._step = Number(newValue) || 10;
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Type property
	get type() { return this._type; }
	set type(value) {
		this._type = value;
		this._updateOscillator();
	}

	// Frequency property
	get frequency() { return this._frequency; }
	set frequency(value) {
		this._frequency = Number(value);
		this._updateOscillator();
	}

	// Detune property
	get detune() { return this._detune; }
	set detune(value) {
		this._detune = Number(value);
		this._updateOscillator();
	}

	// Play property
	get play() { return this._play; }
	set play(value) {
		this._play = Boolean(value);
		if (this._ready) {
			if (this._play) {
				this.component.set(this.options);
				this.component.start();
			} else {
				this.component.stop();
			}
		}
	}

	_updateOscillator() {
		if (not(this._ready)) return;
		this.options = {
			type: this._type,
			frequency: this._frequency,
			detune: this._detune
		};
		this.component.set(this.options);
	}
}

customElements.define('audio-oscillator', AudioOscillator);

export { AudioOscillator };
