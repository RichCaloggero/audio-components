// audio-stereoProcessor.js
// Native Web Component for stereo processor
// Replaces Polymer-based AudioStereoProcessor

import { AudioComponentBase } from "./audio-component-base.js";
import { StereoProcessor } from "./stereoProcessor.js";

let instanceCount = 0;

class AudioStereoProcessor extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'rotation', 'center', 'width', 'balance'
		];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-stereo-processor-${instanceCount}`;

		// Stereo processor properties
		this._rotation = 0;
		this._center = 0;
		this._width = 0;
		this._balance = 0;

		// Create the audio component
		this.component = new StereoProcessor(this.audio, this);
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-stereo-processor">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1.0" max="1.0" step="0.1"></ui-number>

				<ui-number label="rotation" min="-180" max="180" step="1"></ui-number>
				<ui-number label="center" min="-100.0" max="100.0" step="1"></ui-number>
				<ui-number label="width" min="0.0" max="200.0" step="1"></ui-number>
				<ui-number label="balance" min="-100.0" max="100.0" step="1"></ui-number>
			</fieldset>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	} // connectedCallback

	_setupEventListeners() {
		// Bypass control
		const bypassEl = this.shadowRoot.querySelector('ui-boolean[label="bypass"]');
		if (bypassEl) {
			bypassEl.value = this._bypass;
			bypassEl.addEventListener('value-changed', (e) => this.bypass = e.detail.value);
		} // if bypassEl

		// Mix control
		const mixEl = this.shadowRoot.querySelector('ui-number[label="mix"]');
		if (mixEl) {
			mixEl.value = this._mix;
			mixEl.addEventListener('value-changed', (e) => this.mix = e.detail.value);
		} // if mixEl

		// Rotation control
		const rotationEl = this.shadowRoot.querySelector('ui-number[label="rotation"]');
		if (rotationEl) {
			rotationEl.value = this._rotation;
			rotationEl.addEventListener('value-changed', (e) => this.rotation = e.detail.value);
		} // if rotationEl

		// Center control
		const centerEl = this.shadowRoot.querySelector('ui-number[label="center"]');
		if (centerEl) {
			centerEl.value = this._center;
			centerEl.addEventListener('value-changed', (e) => this.center = e.detail.value);
		} // if centerEl

		// Width control
		const widthEl = this.shadowRoot.querySelector('ui-number[label="width"]');
		if (widthEl) {
			widthEl.value = this._width;
			widthEl.addEventListener('value-changed', (e) => this.width = e.detail.value);
		} // if widthEl

		// Balance control
		const balanceEl = this.shadowRoot.querySelector('ui-number[label="balance"]');
		if (balanceEl) {
			balanceEl.value = this._balance;
			balanceEl.addEventListener('value-changed', (e) => this.balance = e.detail.value);
		} // if balanceEl
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'rotation':
				this.rotation = Number(newValue) || 0;
				break; // case rotation
			case 'center':
				this.center = Number(newValue) || 0;
				break; // case center
			case 'width':
				this.width = Number(newValue) || 0;
				break; // case width
			case 'balance':
				this.balance = Number(newValue) || 0;
				break; // case balance
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Rotation property
	get rotation() { return this._rotation; }
	set rotation(value) {
		this._rotation = Number(value);
		if (this._ready && this.component) {
			this.component.rotation = this._rotation;
		} // if ready
	} // set rotation

	// Center property
	get center() { return this._center; }
	set center(value) {
		this._center = Number(value);
		if (this._ready && this.component) {
			this.component.center = this._center;
		} // if ready
	} // set center

	// Width property
	get width() { return this._width; }
	set width(value) {
		this._width = Number(value);
		if (this._ready && this.component) {
			this.component.width = this._width;
		} // if ready
	} // set width

	// Balance property
	get balance() { return this._balance; }
	set balance(value) {
		this._balance = Number(value);
		if (this._ready && this.component) {
			this.component.balance = this._balance;
		} // if ready
	} // set balance
} // class AudioStereoProcessor

customElements.define('audio-stereo-processor', AudioStereoProcessor);

export { AudioStereoProcessor };
