// audio-delay.js
// Native Web Component for delay node
// Replaces Polymer-based AudioDelay

import { AudioComponentBase } from "./audio-component-base.js";
import { Delay } from "./audio-component.js";

let instanceCount = 0;

class AudioDelay extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass', 'delay', 'step'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-delay-${instanceCount}`;

		// Delay-specific properties
		this._delay = 0.0;
		this._step = 0.00001;

		// Create the audio component
		this.component = new Delay(this.audio);
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-delay">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1.0" max="1.0" step="0.1"></ui-number>
				<ui-number label="delay" type="number" min="0.0" max="1.0" step="${this._step}"></ui-number>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	}

	_setupEventListeners() {
		// Bypass control
		const bypassEl = this.shadowRoot.querySelector('ui-boolean[label="bypass"]');
		if (bypassEl) {
			bypassEl.value = this._bypass;
			bypassEl.addEventListener('value-changed', (e) => this.bypass = e.detail.value);
		}

		// Mix control
		const mixEl = this.shadowRoot.querySelector('ui-number[label="mix"]');
		if (mixEl) {
			mixEl.value = this._mix;
			mixEl.addEventListener('value-changed', (e) => this.mix = e.detail.value);
		}

		// Delay control
		const delayEl = this.shadowRoot.querySelector('ui-number[label="delay"]');
		if (delayEl) {
			delayEl.value = this._delay;
			delayEl.addEventListener('value-changed', (e) => this.delay = e.detail.value);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'delay':
				this.delay = Number(newValue) || 0;
				break;
			case 'step':
				this._step = Number(newValue) || 0.00001;
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Delay property
	get delay() { return this._delay; }
	set delay(value) {
		this._delay = Number(value);
		if (this._ready && this.component?.delay) {
			this.component.delay.delayTime.value = this._delay;
		}
	}

	// Step property
	get step() { return this._step; }
	set step(value) {
		this._step = Number(value);
	}
}

customElements.define('audio-delay', AudioDelay);

export { AudioDelay };
