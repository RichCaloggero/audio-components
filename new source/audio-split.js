// audio-split.js
// Native Web Component for channel splitter
// Replaces Polymer-based AudioSplit

import { AudioComponentBase, childrenReady } from "./audio-component-base.js";
import { Split } from "./audio-component.js";

let instanceCount = 0;

class AudioSplit extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'swap-outputs', 'swap-inputs'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-split-${instanceCount}`;

		// Mark as container element
		this.container = true;

		// Split-specific properties
		this._swapOutputs = false;
		this._swapInputs = false;
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-split">
				<legend><h2>${this._label}</h2></legend>

				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1.0" max="1.0" step="0.1"></ui-number>
			</fieldset>
			<slot></slot>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		// Wait for all child audio components to be ready before building our component
		childrenReady(this, children => {
			console.log(`${this.id}: all ${children.length} children ready, building split component`);

			// Build the split component with child components
			this.component = new Split(
				this.audio,
				this.components(children),
				this._swapInputs,
				this._swapOutputs
			);
		});
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
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'swap-outputs':
				this._swapOutputs = newValue !== null;
				break;
			case 'swap-inputs':
				this._swapInputs = newValue !== null;
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Swap outputs property
	get swapOutputs() { return this._swapOutputs; }
	set swapOutputs(value) {
		this._swapOutputs = Boolean(value);
	}

	// Swap inputs property
	get swapInputs() { return this._swapInputs; }
	set swapInputs(value) {
		this._swapInputs = Boolean(value);
	}
}

customElements.define('audio-split', AudioSplit);

export { AudioSplit };
