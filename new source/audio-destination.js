// audio-destination.js
// Native Web Component for audio destination (speakers)
// Replaces Polymer-based AudioDestination

import { AudioComponentBase } from "./audio-component-base.js";
import { AudioComponent } from "./audio-component.js";

let instanceCount = 0;

class AudioDestination extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-destination-${instanceCount}`;

		// Create the audio component - connects to audio.destination (speakers)
		this.component = new AudioComponent(this.audio, "speakers");
		this.component.input.connect(this.audio.destination);
		this.component.output = null; // No output - this is the end of the chain
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-destination">
				<legend><h2>${this._label}</h2></legend>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	}
}

customElements.define('audio-destination', AudioDestination);

export { AudioDestination };
