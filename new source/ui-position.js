// ui-position.js
// Native Web Component for 3D position input control
// Replaces Polymer-based UIPosition

import { UIBase } from "./ui.js";

let instanceCount = 0;

function clamp(value, min = -1000, max = 1000) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
} // clamp

class UIPosition extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-position-${instanceCount}`;
		this._value = '0, 0, 0';
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; margin: 0.25em 0; }
				.ui-position { display: flex; flex-direction: column; }
				label { font-weight: bold; margin-bottom: 0.25em; }
				span[role="application"] {
					padding: 0.25em;
					border: 1px solid #ccc;
					min-width: 100px;
					display: inline-block;
				}
				span[role="application"]:focus {
					outline: 2px solid #007bff;
					border-color: #007bff;
				}
			</style>
			<div class="ui-position">
				<label id="label">${this._label}</label>
				<span id="input" role="application" tabindex="0" aria-labelledby="label">${this._value}</span>
			</div>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
	} // connectedCallback

	_setupEventListeners() {
		// Keyboard handling is done by document-level handler in ui.js
		// No per-component listeners needed
	} // _setupEventListeners

	// Value property
	get value() { return this._value; }
	set value(val) {
		if (this._value !== val) {
			this._value = val || '0, 0, 0';
			this._updateDisplay();
			this._notifyValueChange(this._value);
		} // if changed
	} // set value

	_updateDisplay() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.textContent = this._value;
		} // if input
	} // _updateDisplay

	// Handler method called by table-driven keyboard dispatcher in ui.js
	// axisIndex: 0=X, 1=Y, 2=Z
	// delta: 1 or -1 for direction
	adjustAxis(axisIndex, delta) {
		const text = this._value || "0, 0, 0";
		const vector = text.split(",").map(x => Number(x.trim()));

		// Ensure we have 3 components
		while (vector.length < 3) vector.push(0);

		// Adjust the specified axis
		vector[axisIndex] = clamp(vector[axisIndex] + delta);

		this._value = vector.join(", ");
		this._updateDisplay();
		this._notifyValueChange(this._value);
	} // adjustAxis
} // class UIPosition

customElements.define('ui-position', UIPosition);

export { UIPosition };
