// audio-gain.js
// Native Web Component for gain node
// Replaces Polymer-based AudioGain

import { AudioComponentBase } from "./audio-component-base.js";
import { Gain } from "./audio-component.js";

let instanceCount = 0;

class AudioGain extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass', 'gain', 'min', 'max', 'step'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-gain-${instanceCount}`;

		// Gain-specific properties
		this._gainValue = 1.0;
		this._min = -2.0;
		this._max = 2.0;
		this._step = 0.1;

		// Create the audio component
		this.component = new Gain(this.audio, this._gainValue, this);
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset>
				<legend><h2>${this._label}</h2></legend>
				<ui-number label="gain" min="${this._min}" max="${this._max}" step="${this._step}"></ui-number>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		// Leaf node - ready immediately after setup
		this.isReady = true;
	}

	_setupEventListeners() {
		const gainEl = this.shadowRoot.querySelector('ui-number[label="gain"]');
		if (gainEl) {
			gainEl.value = this._gainValue;
			gainEl.addEventListener('value-changed', (e) => {
				this.gain = e.detail.value;
			});
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'gain':
				this.gain = Number(newValue) || 1.0;
				break;
			case 'min':
				this._min = Number(newValue) || -2.0;
				this._updateGainControl();
				break;
			case 'max':
				this._max = Number(newValue) || 2.0;
				this._updateGainControl();
				break;
			case 'step':
				this._step = Number(newValue) || 0.1;
				this._updateGainControl();
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Gain property
	get gain() { return this._gainValue; }
	set gain(value) {
		this._gainValue = Number(value);
		if (this._ready && this.component) {
			this.component.gain = this._gainValue;
		}
		this._updateUI('gain', this._gainValue);
	}

	// Min property
	get min() { return this._min; }
	set min(value) {
		this._min = Number(value);
		this._updateGainControl();
	}

	// Max property
	get max() { return this._max; }
	set max(value) {
		this._max = Number(value);
		this._updateGainControl();
	}

	// Step property
	get step() { return this._step; }
	set step(value) {
		this._step = Number(value);
		this._updateGainControl();
	}

	_updateGainControl() {
		const gainEl = this.shadowRoot?.querySelector('ui-number[label="gain"]');
		if (gainEl) {
			gainEl.min = this._min;
			gainEl.max = this._max;
			gainEl.step = this._step;
		}
	}
}

customElements.define('audio-gain', AudioGain);

export { AudioGain };
