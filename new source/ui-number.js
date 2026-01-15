// ui-number.js
// Native Web Component for numeric input control
// Replaces Polymer-based UINumber

import { UIBase, defineKey, hasModifierKeys } from "./ui.js";

let instanceCount = 0;

class UINumber extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut', 'type', 'min', 'max', 'step'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-number-${instanceCount}`;

		this._type = 'range';
		this._min = 0.0;
		this._max = 1.0;
		this._step = 0.1;
		this._value = 0;
	}

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
	}

	connectedCallback() {
		super.connectedCallback();
		// Sync value from attribute if present
		if (this.hasAttribute('value')) {
			this._value = Number(this.getAttribute('value'));
		}
		this._updateInputValue();
	}

	_setupEventListeners() {
		const input = this.shadowRoot.querySelector('#input');
		if (input) {
			input.addEventListener('input', (e) => {
				this._value = Number(e.target.value);
				this._notifyValueChange(this._value);
			});
			input.addEventListener('change', (e) => {
				this._value = Number(e.target.value);
				this._notifyValueChange(this._value);
			});
			input.addEventListener('keydown', (e) => this._handleKeydown(e));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'type':
				this._type = newValue || 'range';
				this._updateInputType();
				break;
			case 'min':
				this._min = Number(newValue) || 0;
				this._updateInputAttribute('min', this._min);
				break;
			case 'max':
				this._max = Number(newValue) || 1;
				this._updateInputAttribute('max', this._max);
				break;
			case 'step':
				this._step = Number(newValue) || 0.1;
				this._updateInputAttribute('step', this._step);
				break;
			case 'value':
				this._value = Number(newValue) || 0;
				this._updateInputValue();
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Type property
	get type() { return this._type; }
	set type(value) {
		this._type = value || 'range';
		this._updateInputType();
	}

	// Min property
	get min() { return this._min; }
	set min(value) {
		this._min = Number(value);
		this._updateInputAttribute('min', this._min);
	}

	// Max property
	get max() { return this._max; }
	set max(value) {
		this._max = Number(value);
		this._updateInputAttribute('max', this._max);
	}

	// Step property
	get step() { return this._step; }
	set step(value) {
		this._step = Number(value);
		this._updateInputAttribute('step', this._step);
	}

	// Value property
	get value() { return this._value; }
	set value(val) {
		const newValue = Number(val);
		if (this._value !== newValue) {
			this._value = newValue;
			this._updateInputValue();
			this._notifyValueChange(this._value);
		}
	}

	_updateInputValue() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input && input.value !== String(this._value)) {
			input.value = this._value;
		}
	}

	_updateInputAttribute(attr, value) {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.setAttribute(attr, value);
		}
	}

	_updateInputType() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.type = this._type;
		}
	}

	_handleKeydown(e) {
		const input = e.target;
		const value = Number(input.value);
		const step = Number(this._step);

		// First let parent handle common shortcuts
		if (super.handleSpecialKeys(e)) {
			// Parent didn't handle it, check our own handlers
			switch (e.key) {
				case "Home":
					if (e.ctrlKey) {
						this.setMax();
					} else if (this._type === "number") {
						return; // let default behavior
					}
					break;

				case "End":
					if (e.ctrlKey) {
						this.setMin();
					} else if (this._type === "number") {
						return; // let default behavior
					}
					break;

				case "PageUp":
					if (hasModifierKeys(e)) return;
					this.increase(10 * step);
					break;

				case "PageDown":
					if (hasModifierKeys(e)) return;
					this.decrease(10 * step);
					break;

				case "-":
					if ((this._type === "number" && e.shiftKey) || !hasModifierKeys(e)) {
						input.value = -1 * value;
						this._value = Number(input.value);
						this._notifyValueChange(this._value);
					} else {
						return;
					}
					break;

				case "0":
				case "1":
					if (this._type === "number" || hasModifierKeys(e)) return;
					input.value = Number(e.key);
					this._value = Number(input.value);
					this._notifyValueChange(this._value);
					break;

				default:
					return; // don't prevent default for unhandled keys
			}
		}

		e.preventDefault();
	}

	reset() {
		this.value = (this._max - this._min) / 2.0 + this._min;
	}

	setMax() {
		this.value = this._max;
	}

	setMin() {
		this.value = this._min;
	}

	increase(step = this._step) {
		this.value = this.clamp(Number(this._value) + step);
		return this._value;
	}

	decrease(step = this._step) {
		this.value = this.clamp(Number(this._value) - step);
		return this._value;
	}

	clamp(value, min = this._min, max = this._max) {
		value = Number(value);
		min = Number(min);
		max = Number(max);
		if (value < min) return min;
		else if (value > max) return max;
		else return value;
	}
}

customElements.define('ui-number', UINumber);

export { UINumber };
