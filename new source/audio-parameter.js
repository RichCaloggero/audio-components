// audio-parameter.js
// Native Web Component for parameter automation definition
// Replaces Polymer-based AudioParameter

import { AudioComponentBase, statusMessage, not } from "./audio-component-base.js";
import { updateParameter } from "./audio-control.js";

let instanceCount = 0;

class AudioParameter extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'name', 'function', 'type'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-parameter-${instanceCount}`;

		// Mark as container element
		this.container = true;

		// Parameter-specific properties
		this._paramName = '';
		this._function = '';
		this._paramType = '';
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h3 { margin: 0; font-size: 1em; }
			</style>
			<fieldset class="audio-parameter">
				<legend><h3>${this._label}</h3></legend>
				<ui-text label="function" shortcut="alt shift f"></ui-text>
			</fieldset>
			<slot></slot>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	}

	_setupEventListeners() {
		const functionEl = this.shadowRoot.querySelector('ui-text[label="function"]');
		if (functionEl) {
			functionEl.value = this._function;
			functionEl.addEventListener('value-changed', (e) => {
				this.function = e.detail.value;
			});
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'name':
				this._paramName = newValue || '';
				this._update();
				break;
			case 'function':
				this._function = newValue || '';
				this._update();
				break;
			case 'type':
				this._paramType = newValue || '';
				this._update();
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Name property (the parameter to automate on target)
	get name() { return this._paramName; }
	set name(value) {
		this._paramName = value || '';
		this._update();
	}

	// Function property (JS expression for automation)
	get function() { return this._function; }
	set function(value) {
		this._function = value || '';
		this._update();
	}

	// Type property
	get type() { return this._paramType; }
	set type(value) {
		this._paramType = value || '';
		this._update();
	}

	_update() {
		const controller = this.parentElement;
		if (not(controller)) return;

		console.debug(`${this.id}: requesting update for ${this._paramName}, ${this._function}, ${this._paramType}...`);

		if (not(this._paramName)) return;

		if (this._function && this._paramType) {
			statusMessage(`${this.id}: parameter ${this._paramName} - cannot set both function and type; not updating...`);
			return;
		}

		console.debug(`- calling ${controller.id}.updateParameter`);
		updateParameter(controller, this._paramName, this._function, this._paramType);
	}
}

customElements.define('audio-parameter', AudioParameter);

export { AudioParameter };
