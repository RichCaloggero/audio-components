// ui-list.js
// Native Web Component for select/dropdown control
// Replaces Polymer-based UIList

import { UIBase } from "./ui.js";
import { statusMessage } from "./audio-component-base.js";

let instanceCount = 0;

class UIList extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut', 'values', 'initial-value'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-list-${instanceCount}`;
		this._value = '';
		this._values = '';
		this._initialValue = '';
	}

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
	}

	connectedCallback() {
		super.connectedCallback();
		// Build list if values are already set
		if (this._values) {
			this._buildList(this._values);
		}
	}

	_setupEventListeners() {
		const select = this.shadowRoot.querySelector('#input');
		if (select) {
			select.addEventListener('change', (e) => {
				this._value = e.target.value;
				this._notifyValueChange(this._value);
			});
			select.addEventListener('keydown', (e) => this.handleSpecialKeys(e));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'values':
				this._values = newValue || '';
				this._buildList(this._values);
				break;
			case 'initial-value':
				this._initialValue = newValue || '';
				this._applyInitialValue();
				break;
			case 'value':
				this._value = newValue || '';
				this._updateSelectValue();
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Values property (comma-separated or JSON array)
	get values() { return this._values; }
	set values(val) {
		this._values = val || '';
		this._buildList(this._values);
	}

	// Initial value property
	get initialValue() { return this._initialValue; }
	set initialValue(val) {
		this._initialValue = val || '';
		this._applyInitialValue();
	}

	// Value property
	get value() { return this._value; }
	set value(val) {
		if (this._value !== val) {
			this._value = val;
			this._updateSelectValue();
			this._notifyValueChange(this._value);
		}
	}

	_updateSelectValue() {
		const select = this.shadowRoot?.querySelector('#input');
		if (select && select.value !== this._value) {
			select.value = this._value;
		}
	}

	_applyInitialValue() {
		const select = this.shadowRoot?.querySelector('#input');
		if (select && this._initialValue) {
			select.value = this._initialValue;
			this._value = this._initialValue;
			select.dispatchEvent(new CustomEvent("change", { composed: true, bubbles: true }));
		}
	}

	_buildList(newList) {
		const select = this.shadowRoot?.querySelector('#input');
		if (!select) {
			console.log("- no select element to add items to");
			return;
		}

		select.innerHTML = "";

		const processedValues = UIBase.processValues(newList || this._values);
		if (processedValues && processedValues.length) {
			processedValues.forEach(pair => {
				const option = document.createElement("option");
				option.value = pair.value;
				option.text = pair.text;
				select.add(option);
			});
		}

		// Apply initial value if set
		if (this._initialValue) {
			this._applyInitialValue();
		}

		return select;
	}
}

customElements.define('ui-list', UIList);

export { UIList };
