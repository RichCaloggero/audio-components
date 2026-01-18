// ui-list.js
// Native Web Component for select/dropdown control
// Replaces Polymer-based UIList

import { UIBase } from "./ui.js";
import { statusMessage, not } from "./audio-component-base.js";

let instanceCount = 0;

class UIList extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut', 'values', 'initial-value'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-list-${instanceCount}`;
		this._value = '';
		this._values = '';
		this._initialValue = '';
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; margin: 0.25em 0; }
				.ui-list { display: flex; flex-direction: column; }
				label { font-weight: bold; margin-bottom: 0.25em; }
				select { padding: 0.25em; }
			</style>
			<div class="ui-list">
				<label for="input">${this._label}</label>
				<select id="input"></select>
			</div>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();
		// Build list if values are already set
		if (this._values) {
			this._buildList(this._values);
		} // if values
	} // connectedCallback

	_setupEventListeners() {
		const select = this.shadowRoot.querySelector('#input');
		if (select) {
			select.addEventListener('change', (e) => {
				this._value = e.target.value;
				this._notifyValueChange(this._value);
			}); // change
			// Keyboard handling is done by document-level handler in ui.js
			// Native select handles arrow key navigation
		} // if select
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'values':
				this._values = newValue || '';
				// Only build list if shadow DOM is ready (select element exists)
				if (this.shadowRoot?.querySelector('#input')) {
					this._buildList(this._values);
				} // if select ready
				break; // case values
			case 'initial-value':
				this._initialValue = newValue || '';
				this._applyInitialValue();
				break; // case initial-value
			case 'value':
				this._value = newValue || '';
				this._updateSelectValue();
				break; // case value
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Values property (comma-separated or JSON array)
	get values() { return this._values; }
	set values(val) {
		this._values = val || '';
		this._buildList(this._values);
	} // set values

	// Initial value property
	get initialValue() { return this._initialValue; }
	set initialValue(val) {
		this._initialValue = val || '';
		this._applyInitialValue();
	} // set initialValue

	// Value property
	get value() { return this._value; }
	set value(val) {
		if (this._value !== val) {
			this._value = val;
			this._updateSelectValue();
			this._notifyValueChange(this._value);
		} // if changed
	} // set value

	_updateSelectValue() {
		const select = this.shadowRoot?.querySelector('#input');
		if (select && select.value !== this._value) {
			select.value = this._value;
		} // if select
	} // _updateSelectValue

	_applyInitialValue() {
		const select = this.shadowRoot?.querySelector('#input');
		if (select && this._initialValue) {
			select.value = this._initialValue;
			this._value = this._initialValue;
			select.dispatchEvent(new CustomEvent("change", { composed: true, bubbles: true }));
		} // if select
	} // _applyInitialValue

	_buildList(newList) {
		const select = this.shadowRoot?.querySelector('#input');
		if (not(select)) {
			console.log("- no select element to add items to");
			return;
		} // if no select

		select.innerHTML = "";

		const processedValues = UIBase.processValues(newList || this._values);
		if (processedValues && processedValues.length) {
			processedValues.forEach(pair => {
				const option = document.createElement("option");
				option.value = pair.value;
				option.text = pair.text;
				select.add(option);
			}); // forEach pair
		} // if processedValues

		// Apply initial value if set
		if (this._initialValue) {
			this._applyInitialValue();
		} // if initialValue

		return select;
	} // _buildList
} // class UIList

customElements.define('ui-list', UIList);

export { UIList };
