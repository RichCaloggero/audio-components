// audio-filter.js
// Native Web Component for biquad filter node
// Replaces Polymer-based AudioFilter

import { AudioComponentBase } from "./audio-component-base.js";
import { Filter } from "./audio-component.js";

let instanceCount = 0;

const FILTER_TYPES = [
	["peaking", "peaking"],
	["notch", "notch"],
	["bandpass", "band pass"],
	["lowpass", "low pass"],
	["highpass", "high pass"],
	["lowshelf", "low shelf"],
	["highshelf", "high shelf"],
	["allpass", "all pass"]
];

class AudioFilter extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'type', 'frequency', 'q', 'gain', 'detune'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-filter-${instanceCount}`;

		// Filter-specific properties
		this._type = 'lowpass';
		this._frequency = 350;
		this._q = 1;
		this._filterGain = 1;
		this._detune = 0;

		// Create the audio component
		this.component = new Filter(this.audio);
	}

	get template() {
		const typeOptions = JSON.stringify(FILTER_TYPES);
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-filter">
				<legend><h2>${this._label}</h2></legend>

				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="0.0" max="1.0" step="0.1"></ui-number>

				<ui-list label="type" values='${typeOptions}'></ui-list>

				<ui-number label="frequency" type="number" min="20" max="20000" step="10.0"></ui-number>
				<ui-number label="Q" type="number" min="-100.0" max="100.0" step="0.01"></ui-number>

				<ui-number label="gain" min="-30.0" max="30.0" step="1"></ui-number>
				<ui-number label="detune" min="0.0" max="100.0" step="1"></ui-number>
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

		// Type control
		const typeEl = this.shadowRoot.querySelector('ui-list[label="type"]');
		if (typeEl) {
			typeEl.value = this._type;
			typeEl.addEventListener('value-changed', (e) => this.type = e.detail.value);
		}

		// Frequency control
		const freqEl = this.shadowRoot.querySelector('ui-number[label="frequency"]');
		if (freqEl) {
			freqEl.value = this._frequency;
			freqEl.addEventListener('value-changed', (e) => this.frequency = e.detail.value);
		}

		// Q control
		const qEl = this.shadowRoot.querySelector('ui-number[label="Q"]');
		if (qEl) {
			qEl.value = this._q;
			qEl.addEventListener('value-changed', (e) => this.q = e.detail.value);
		}

		// Gain control
		const gainEl = this.shadowRoot.querySelector('ui-number[label="gain"]');
		if (gainEl) {
			gainEl.value = this._filterGain;
			gainEl.addEventListener('value-changed', (e) => this.filterGain = e.detail.value);
		}

		// Detune control
		const detuneEl = this.shadowRoot.querySelector('ui-number[label="detune"]');
		if (detuneEl) {
			detuneEl.value = this._detune;
			detuneEl.addEventListener('value-changed', (e) => this.detune = e.detail.value);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'type':
				this.type = newValue || 'lowpass';
				break;
			case 'frequency':
				this.frequency = Number(newValue) || 350;
				break;
			case 'q':
				this.q = Number(newValue) || 1;
				break;
			case 'gain':
				this.filterGain = Number(newValue) || 1;
				break;
			case 'detune':
				this.detune = Number(newValue) || 0;
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Type property
	get type() { return this._type; }
	set type(value) {
		this._type = value;
		if (this._ready && this.component) {
			this.component.type = value;
		}
	}

	// Frequency property
	get frequency() { return this._frequency; }
	set frequency(value) {
		this._frequency = Number(value);
		if (this._ready && this.component) {
			this.component.frequency = this._frequency;
		}
	}

	// Q property
	get q() { return this._q; }
	set q(value) {
		this._q = Number(value);
		if (this._ready && this.component) {
			this.component.q = this._q;
		}
	}

	// Filter gain property (separate from mix gain)
	get filterGain() { return this._filterGain; }
	set filterGain(value) {
		this._filterGain = Number(value);
		if (this._ready && this.component) {
			this.component.gain = this._filterGain;
		}
	}

	// Detune property
	get detune() { return this._detune; }
	set detune(value) {
		this._detune = Number(value);
		if (this._ready && this.component) {
			this.component.detune = this._detune;
		}
	}
}

customElements.define('audio-filter', AudioFilter);

export { AudioFilter };
