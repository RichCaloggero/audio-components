// audio-parallel.js
// Native Web Component for parallel audio connection
// Replaces Polymer-based AudioParallel

import { AudioComponentBase, childrenReady } from "./audio-component-base.js";
import { Parallel } from "./audio-component.js";

let instanceCount = 0;

class AudioParallel extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-parallel-${instanceCount}`;

		// Mark as container element
		this.container = true;
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
				legend[hidden] { display: none; }
			</style>
			<fieldset class="audio-parallel">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1" max="1" step="0.1"></ui-number>
			</fieldset>
			<slot></slot>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		// Wait for all child audio components to be ready before building our component
		childrenReady(this, children => {
			console.log(`${this.id}: all ${children.length} children ready, building parallel component`);

			// Build the parallel component with child components
			this.component = new Parallel(this.audio, this.components(children));

			// Hide legend if all UI controls are hidden
			if (this.uiControls().every(x => x.hidden)) {
				const legend = this.shadowRoot.querySelector("legend");
				if (legend) legend.hidden = true;
			}
		});
	}

	_setupEventListeners() {
		// Bypass control
		const bypassEl = this.shadowRoot.querySelector('ui-boolean[label="bypass"]');
		if (bypassEl) {
			bypassEl.value = this._bypass;
			bypassEl.addEventListener('value-changed', (e) => {
				this.bypass = e.detail.value;
			});
		}

		// Mix control
		const mixEl = this.shadowRoot.querySelector('ui-number[label="mix"]');
		if (mixEl) {
			mixEl.value = this._mix;
			mixEl.addEventListener('value-changed', (e) => {
				this.mix = e.detail.value;
			});
		}
	}
}

customElements.define('audio-parallel', AudioParallel);

export { AudioParallel };
