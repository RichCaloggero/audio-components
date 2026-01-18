// audio-channelSwap.js
// Native Web Component for channel swap
// Replaces Polymer-based AudioChannelSwap

import { AudioComponentBase } from "./audio-component-base.js";
import { ChannelSwap } from "./audio-component.js";

let instanceCount = 0;

class AudioChannelSwap extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-channelswap-${instanceCount}`;

		// Create the audio component
		this.component = new ChannelSwap(this.audio);
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="channel-swap">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1" max="1" step="0.1"></ui-number>
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
	} // _setupEventListeners
} // class AudioChannelSwap

customElements.define('audio-channelswap', AudioChannelSwap);

export { AudioChannelSwap };
