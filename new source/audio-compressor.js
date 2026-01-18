// audio-compressor.js
// Native Web Component for dynamics compressor node
// Replaces Polymer-based AudioCompressor

import { AudioComponentBase, statusMessage } from "./audio-component-base.js";
import { Compressor } from "./audio-component.js";

let instanceCount = 0;

class AudioCompressor extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'ratio', 'threshold', 'knee', 'attack', 'release'
		];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-compressor-${instanceCount}`;

		// Compressor properties
		this._ratio = 10.0;
		this._threshold = -40.0;
		this._knee = 20.0;
		this._attack = 0.1;
		this._release = 0.75;
		this._reduction = 0;

		this.component = new Compressor(this.audio);
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-compressor">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1.0" max="1.0" step="0.1"></ui-number>

				<ui-number label="ratio" min="0.0" max="100.0" step="1"></ui-number>
				<ui-number label="threshold" min="-150.0" max="20.0" step="1"></ui-number>
				<ui-number label="knee" min="0.0" max="50.0" step="1"></ui-number>

				<ui-number label="attack" min="0.0" max="10.0" step="0.1"></ui-number>
				<ui-number label="release" min="0.0" max="10.0" step="0.1"></ui-number>
			</fieldset>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	} // connectedCallback

	_setupEventListeners() {
		// Bypass
		this._bindControl('ui-boolean[label="bypass"]', '_bypass', 'bypass');

		// Mix
		this._bindControl('ui-number[label="mix"]', '_mix', 'mix');

		// Compressor controls
		this._bindControl('ui-number[label="ratio"]', '_ratio', 'ratio');
		this._bindControl('ui-number[label="threshold"]', '_threshold', 'threshold');
		this._bindControl('ui-number[label="knee"]', '_knee', 'knee');
		this._bindControl('ui-number[label="attack"]', '_attack', 'attack');
		this._bindControl('ui-number[label="release"]', '_release', 'release');
	} // _setupEventListeners

	_bindControl(selector, privateProp, publicProp) {
		const el = this.shadowRoot.querySelector(selector);
		if (el) {
			el.value = this[privateProp];
			el.addEventListener('value-changed', (e) => {
				this[publicProp] = e.detail.value;
			}); // value-changed
		} // if el
	} // _bindControl

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'ratio':
				this.ratio = Number(newValue) || 10.0;
				break; // case ratio
			case 'threshold':
				this.threshold = Number(newValue) || -40.0;
				break; // case threshold
			case 'knee':
				this.knee = Number(newValue) || 20.0;
				break; // case knee
			case 'attack':
				this.attack = Number(newValue) || 0.1;
				break; // case attack
			case 'release':
				this.release = Number(newValue) || 0.75;
				break; // case release
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Ratio property
	get ratio() { return this._ratio; }
	set ratio(value) {
		this._ratio = Number(value);
		if (this._ready && this.component?.compressor) {
			this.component.compressor.ratio.value = this._ratio;
			this._reduction = this.component.compressor.reduction;
		} // if ready
	} // set ratio

	// Threshold property
	get threshold() { return this._threshold; }
	set threshold(value) {
		this._threshold = Number(value);
		if (this._ready && this.component?.compressor) {
			this.component.compressor.threshold.value = this._threshold;
			this._reduction = this.component.compressor.reduction;
		} // if ready
	} // set threshold

	// Knee property
	get knee() { return this._knee; }
	set knee(value) {
		this._knee = Number(value);
		if (this._ready && this.component?.compressor) {
			this.component.compressor.knee.value = this._knee;
			this._reduction = this.component.compressor.reduction;
		} // if ready
	} // set knee

	// Attack property
	get attack() { return this._attack; }
	set attack(value) {
		this._attack = Number(value);
		if (this._ready && this.component?.compressor) {
			this.component.compressor.attack.value = this._attack;
			this._reduction = this.component.compressor.reduction;
		} // if ready
	} // set attack

	// Release property
	get release() { return this._release; }
	set release(value) {
		this._release = Number(value);
		if (this._ready && this.component?.compressor) {
			this.component.compressor.release.value = this._release;
			this._reduction = this.component.compressor.reduction;
		} // if ready
	} // set release

	// Reduction property (read-only)
	get reduction() {
		return this.component?.compressor?.reduction || 0;
	} // get reduction
} // class AudioCompressor

customElements.define('audio-compressor', AudioCompressor);

export { AudioCompressor };
