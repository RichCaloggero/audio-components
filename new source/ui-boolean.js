// ui-boolean.js
// Native Web Component for checkbox input control
// Replaces Polymer-based UIBoolean

import { UIBase, defineKey } from "./ui.js";

let instanceCount = 0;

class UIBoolean extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-boolean-${instanceCount}`;
		this._value = false;
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; margin: 0.25em 0; }
				.ui-boolean { display: flex; align-items: center; }
				label { font-weight: bold; cursor: pointer; }
				input { margin-right: 0.5em; }
			</style>
			<div class="ui-boolean">
				<label>
					<input id="input" type="checkbox" ${this._value ? 'checked' : ''}>
					${this._label}
				</label>
			</div>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		// Sync value from attribute if present
		if (this.hasAttribute('value')) {
			const attrValue = this.getAttribute('value');
			this._value = attrValue === 'true' || attrValue === '' || attrValue === 'checked';
		} // if has value
		this._updateInputValue();
	} // connectedCallback

	_setupEventListeners() {
		const input = this.shadowRoot.querySelector('#input');
		if (input) {
			input.addEventListener('change', (e) => {
				this._value = e.target.checked;
				this._notifyValueChange(this._value);
			}); // change
			input.addEventListener('click', (e) => {
				this._value = e.target.checked;
				this._notifyValueChange(this._value);
			}); // click
			// Keyboard handling is done by document-level handler in ui.js
			// Native checkbox handles Space toggle
		} // if input
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'value':
				this._value = newValue === 'true' || newValue === '' || newValue === 'checked';
				this._updateInputValue();
				break; // case value
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Value property
	get value() { return this._value; }
	set value(val) {
		const newValue = Boolean(val === true || val === 'true' || val === '' || val === 'checked');
		if (this._value !== newValue) {
			this._value = newValue;
			this._updateInputValue();
			this._notifyValueChange(this._value);
		} // if changed
	} // set value

	_updateInputValue() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input) {
			input.checked = this._value;
		} // if input
	} // _updateInputValue
} // class UIBoolean

customElements.define('ui-boolean', UIBoolean);

export { UIBoolean };
