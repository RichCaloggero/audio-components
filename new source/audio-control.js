// audio-control.js
// Native Web Component for parameter automation control
// Replaces Polymer-based AudioControl

import {
	AudioComponentBase,
	childrenReady,
	addToAutomationQueue,
	removeFromAutomationQueue,
	getAutomationInterval,
	statusMessage
} from "./audio-component-base.js";
import { AudioComponent } from "./audio-component.js";

let instanceCount = 0;

class AudioControl extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-control-${instanceCount}`;

		// Mark as container element
		this.container = true;

		this._init = false;
		this.target = null;
		this.parameters = [];
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				.audio-control { margin: 0.5em 0; }
			</style>
			<div class="audio-control">
			</div>
			<slot></slot>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		childrenReady(this, children => {
			if (children.length < 2) {
				throw new Error(`${this.id}: need two or more children`);
			}

			this.component = new AudioComponent(this.audio, "control", this);

			// First child is target (element we're controlling)
			// Remaining children are audio-parameter definitions
			this.target = children[0];
			console.debug(`${this.id}: target ${this.target.id}`);

			// Connect through target element's component
			const targetComponent = this.target.component;
			this.component.input.connect(targetComponent.input);
			targetComponent.output.connect(this.component.wet);

			console.debug(`${this.id} "${this._label}": no target node`);

			// Start JS-based automation for this element
			this.start();
			console.debug(`${this.id} added to automation queue`);
		});
	}

	automate() {
		if (!this._ready) return;

		const target = this.target;
		const automationInterval = getAutomationInterval();

		this.parameters.forEach(parameter => {
			const p = target[parameter.name];
			try {
				if (parameter.function) {
					const value = parameter.function(this.audio.currentTime);

					if (p instanceof AudioParam) {
						p.exponentialRampToValueAtTime(value, automationInterval);
					} else {
						target[parameter.name] = value;
						console.debug(`parameter ${this.target.id}.${parameter.name} = ${value} at time ${this.audio.currentTime}`);
					}
				}
			} catch (e) {
				statusMessage(e.toString());
				parameter.function = null;
			}
		});
	}

	start() {
		addToAutomationQueue(this);
	}

	stop() {
		removeFromAutomationQueue(this);
	}
}

customElements.define('audio-control', AudioControl);

// Utility function to update automation parameter
export function updateParameter(controller, _name, _text, _type) {
	console.debug(`${controller.id}.updateParameter: ${_name} ${_text}`);
	if (!_name) return;

	const parameters = controller.parameters;
	console.debug("- parameters: ", parameters);

	const index = parameters.findIndex(p => p.name === _name);
	const parameter = index >= 0 ? parameters[index] : {};
	parameter.name = _name;
	parameter.text = _text;
	parameter.type = _type;

	if (parameter.text) {
		parameter.function = compileFunction(parameter.text, "t");

		if (parameter.function) {
			parameter.function.bind(controller.target);
			controller._init = true;
			console.debug("- function: ", parameter.function);
		} else {
			statusMessage(`automation of parameter ${parameter.name} failed; invalid function;\n${parameter.text}`);
			console.debug("- invalid function");
		}
	} else {
		parameter.function = null;
		if (controller._init) {
			statusMessage(`Automation disabled for ${parameter.name}`);
		}
	}

	if (index < 0) parameters.push(parameter);
	console.debug("- - updated ", index, parameter);
}

// Compile user-defined function for automation
export function compileFunction(text, parameter = "t") {
	try {
		return new Function(parameter,
			`with (Math) {
				function toRange(x, a, b) { return (Math.abs(a-b) * (x+1)/2) + a; }
				function s(x, l=-1.0, u=1.0) { return toRange(Math.sin(x), l, u); }
				function c(x, l=-1.0, u=1.0) { return toRange(Math.cos(x), l, u); }
				function r(a=0, b=1) { return toRange(Math.random(), a, b); }
				return ${text};
			}`
		);
	} catch (e) {
		console.error(e);
		return null;
	}
}

export { AudioControl };
