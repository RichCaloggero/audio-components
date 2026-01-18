// ui-number.js
// Native Web Component for numeric input control
// Replaces Polymer-based UINumber

import { UIBase, defineKey } from "./ui.js";

let instanceCount = 0;

class UINumber extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut', 'type', 'min', 'max', 'step'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-number-${instanceCount}`;

		this._type = 'range';
		this._min = 0.0;
		this._max = 1.0;
		this._step = 0.1;
		this._value = 0;
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; margin: 0.25em 0; }
				.ui-number { display: flex; flex-direction: column; }
				label { font-weight: bold; margin-bottom: 0.25em; }
				input[type="range"] { width: 100%; }
				input[type="number"] { width: 6em; }
			</style>
			<div class="ui-number">
				<label for="input">${this._label}</label>
				<input id="input" type="${this._type}" value="${this._value}" min="${this._min}" max="${this._max}" step="${this._step}">
			</div>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		// Sync value from attribute if present
		if (this.hasAttribute('value')) {
			this._value = Number(this.getAttribute('value'));
		} // if has value
		this._updateInputValue();
	} // connectedCallback

	_setupEventListeners() {
		const input = this.shadowRoot.querySelector('#input');
		if (input) {
			input.addEventListener('input', (e) => {
				this._value = Number(e.target.value);
				this._notifyValueChange(this._value);
			}); // input
			input.addEventListener('change', (e) => {
				this._value = Number(e.target.value);
				this._notifyValueChange(this._value);
			}); // change
			// Keyboard handling is done by document-level handler in ui.js
		} // if input
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'type':
				this._type = newValue || 'range';
				this._updateInputType();
				break; // case type
			case 'min':
				this._min = Number(newValue) || 0;
				this._updateInputAttribute('min', this._min);
				break; // case min
			case 'max':
				this._max = Number(newValue) || 1;
				this._updateInputAttribute('max', this._max);
				break; // case max
			case 'step':
				this._step = Number(newValue) || 0.1;
				this._updateInputAttribute('step', this._step);
				break; // case step
			case 'value':
				this._value = Number(newValue) || 0;
				this._updateInputValue();
				break; // case value
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Type property
	get type() { return this._type; }
	set type(value) {
		this._type = value || 'range';
		this._updateInputType();
	} // set type

	// Min property
	get min() { return this._min; }
	set min(value) {
		this._min = Number(value);
		this._updateInputAttribute('min', this._min);
	} // set min

	// Max property
	get max() { return this._max; }
	set max(value) {
		this._max = Number(value);
		this._updateInputAttribute('max', this._max);
	} // set max

	// Step property
	get step() { return this._step; }
	set step(value) {
		this._step = Number(value);
		this._updateInputAttribute('step', this._step);
	} // set step

	// Value property
	get value() { return this._value; }
	set value(val) {
		const newValue = Number(val);
		if (this._value !== newValue) {
			this._value = newValue;
			this._updateInputValue();
			this._notifyValueChange(this._value);
		} // if changed
	} // set value

	_updateInputValue() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input && input.value !== String(this._value)) {
			input.value = this._value;
		} // if input
	} // _updateInputValue

	_updateInputAttribute(attr, value) {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.setAttribute(attr, value);
		} // if input
	} // _updateInputAttribute

	_updateInputType() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.type = this._type;
		} // if input
	} // _updateInputType

	// Handler methods called by table-driven keyboard dispatcher in ui.js

	negate() {
		this.value = -this._value;
	} // negate

	reset() {
		this.value = (this._max - this._min) / 2.0 + this._min;
	} // reset

	setMax() {
		this.value = this._max;
	} // setMax

	setMin() {
		this.value = this._min;
	} // setMin

	increase(step = this._step) {
		this.value = this.clamp(Number(this._value) + step);
		return this._value;
	} // increase

	decrease(step = this._step) {
		this.value = this.clamp(Number(this._value) - step);
		return this._value;
	} // decrease

	clamp(value, min = this._min, max = this._max) {
		value = Number(value);
		min = Number(min);
		max = Number(max);
		if (value < min) return min;
		else if (value > max) return max;
		else return value;
	} // clamp
} // class UINumber

customElements.define('ui-number', UINumber);

export { UINumber };
