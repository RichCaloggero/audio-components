// ui-text.js
// Native Web Component for text input control
// Replaces Polymer-based UIText

import { UIBase, defineKey } from "./ui.js";

let instanceCount = 0;

class UIText extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-text-${instanceCount}`;
		this._value = '';
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; margin: 0.25em 0; }
				.ui-text { display: flex; flex-direction: column; }
				label { font-weight: bold; margin-bottom: 0.25em; }
				input { padding: 0.25em; }
			</style>
			<div class="ui-text">
				<label for="input">${this._label}</label>
				<input id="input" type="text" value="${this._value}">
			</div>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		// Sync value from attribute if present
		if (this.hasAttribute('value')) {
			this._value = this.getAttribute('value');
		} // if has value
		this._updateInputValue();
	} // connectedCallback

	_setupEventListeners() {
		const input = this.shadowRoot.querySelector('#input');
		if (input) {
			// Only notify on 'change' event (blur or Enter), not on every keystroke
			// This prevents partial values from being sent (e.g., "t", "t.", "t.m" when typing "t.mp3")
			input.addEventListener('change', (e) => {
				this._value = e.target.value;
				this._notifyValueChange(this._value);
			}); // change
			// Keyboard handling is done by document-level handler in ui.js
			// Native text input handles all typing
		} // if input
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'value':
				this._value = newValue || '';
				this._updateInputValue();
				break; // case value
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Value property
	get value() { return this._value; }
	set value(val) {
		const newValue = val || '';
		if (this._value !== newValue) {
			this._value = newValue;
			this._updateInputValue();
			this._notifyValueChange(this._value);
		} // if changed
	} // set value

	_updateInputValue() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input && input.value !== this._value) {
			input.value = this._value;
		} // if input
	} // _updateInputValue
} // class UIText

customElements.define('ui-text', UIText);

export { UIText };
