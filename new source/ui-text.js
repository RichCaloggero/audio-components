// ui-text.js
// Native Web Component for text input control
// Replaces Polymer-based UIText

import { UIBase, defineKey } from "./ui.js";

let instanceCount = 0;

class UIText extends UIBase {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `ui-text-${instanceCount}`;
		this._value = '';
	}

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
	}

	connectedCallback() {
		super.connectedCallback();
		// Sync value from attribute if present
		if (this.hasAttribute('value')) {
			this._value = this.getAttribute('value');
		}
		this._updateInputValue();
	}

	_setupEventListeners() {
		const input = this.shadowRoot.querySelector('#input');
		if (input) {
			input.addEventListener('input', (e) => {
				this._value = e.target.value;
				this._notifyValueChange(this._value);
			});
			input.addEventListener('change', (e) => {
				this._value = e.target.value;
				this._notifyValueChange(this._value);
			});
			input.addEventListener('keydown', (e) => this._handleKeydown(e));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'value':
				this._value = newValue || '';
				this._updateInputValue();
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Value property
	get value() { return this._value; }
	set value(val) {
		const newValue = val || '';
		if (this._value !== newValue) {
			this._value = newValue;
			this._updateInputValue();
			this._notifyValueChange(this._value);
		}
	}

	_updateInputValue() {
		const input = this.shadowRoot?.querySelector('#input');
		if (input && input.value !== this._value) {
			input.value = this._value;
		}
	}

	_handleKeydown(e) {
		// First let parent handle common shortcuts
		if (super.handleSpecialKeys(e)) {
			switch (e.key) {
				case "Enter":
					if (e.ctrlKey) return; // let parent handle Ctrl+Enter
					break;
				default:
					return; // don't prevent default for unhandled keys
			}
		}

		e.preventDefault();
		e.target.dispatchEvent(new CustomEvent("change"));
	}
}

customElements.define('ui-text', UIText);

export { UIText };
