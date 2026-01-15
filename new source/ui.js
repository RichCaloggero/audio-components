// ui.js
// Native Web Component base class for UI elements
// Replaces Polymer-based UI class

import { getShadowRoot, statusMessage } from "./audio-component-base.js";

const savedValues = new Map();
const userKeymap = new Map();

/**
 * Base class for all UI control elements
 * Provides:
 * - Shadow DOM rendering
 * - Keyboard shortcut handling
 * - Value save/swap functionality
 */
export class UIBase extends HTMLElement {
	static get observedAttributes() {
		return ['label', 'name', 'value', 'shortcut'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this._label = '';
		this._name = '';
		this._value = null;
		this._shortcut = '';
		this.defaultModifiers = 'alt shift';
		this.uiElement = null;
	}

	// Template to render - subclasses override this
	get template() {
		return `<slot></slot>`;
	}

	connectedCallback() {
		this.render();
		this.uiElement = this.shadowRoot.querySelector("#input");

		if (this._shortcut && this.uiElement) {
			defineKey(this._shortcut, this.uiElement);
		}
	}

	render() {
		this.shadowRoot.innerHTML = this.template;
		this._setupEventListeners();
	}

	// Override in subclasses to set up event listeners
	_setupEventListeners() {}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'label':
				this._label = newValue || '';
				this._updateLabel();
				break;
			case 'name':
				this._name = newValue || '';
				break;
			case 'value':
				this.value = newValue;
				break;
			case 'shortcut':
				this._shortcut = newValue || '';
				if (this._shortcut && this.uiElement) {
					defineKey(this._shortcut, this.uiElement);
				}
				break;
		}
	}

	// Label property
	get label() { return this._label; }
	set label(value) {
		this._label = value || '';
		this._updateLabel();
	}

	_updateLabel() {
		const labelEl = this.shadowRoot.querySelector("label");
		if (labelEl) labelEl.textContent = this._label;
	}

	// Name property
	get name() { return this._name || this._label; }
	set name(value) { this._name = value || ''; }

	// Value property - subclasses should override getter/setter
	get value() { return this._value; }
	set value(val) {
		const oldValue = this._value;
		this._value = val;
		if (oldValue !== val) {
			this._notifyValueChange(val);
		}
	}

	// Shortcut property
	get shortcut() { return this._shortcut; }
	set shortcut(value) {
		this._shortcut = value || '';
		if (this._shortcut && this.uiElement) {
			defineKey(this._shortcut, this.uiElement);
		}
	}

	// Dispatch value-changed event
	_notifyValueChange(value) {
		this.dispatchEvent(new CustomEvent('value-changed', {
			detail: { value, name: this.name },
			bubbles: true,
			composed: true
		}));
	}

	// Handle special keyboard shortcuts
	handleSpecialKeys(e) {
		const key = e.key;
		if (isModifierKey(key)) return true;
		if (handleUserKey(e)) return false;

		const input = e.target;
		switch (key) {
			case " ":
				if (e.ctrlKey) {
					swapValues(input);
				} else {
					return true;
				}
				break;

			case "Enter":
				if (e.ctrlKey && e.altKey && e.shiftKey) {
					getKey(input);
				} else if (e.ctrlKey) {
					saveValue(input);
				} else {
					return true;
				}
				break;

			default:
				return true;
		}

		e.preventDefault();
		return false;
	}

	// Process values for list controls
	static processValues(values) {
		if (values instanceof String || typeof values === "string") {
			values = values.trim();
			if (values.charAt(0) !== "[" && values.includes(",") && !values.includes('"')) {
				return values.split(",").map(value => value.trim());
			} else {
				try {
					values = JSON.parse(values);
				} catch (e) {
					values = [];
				}
			}
		}

		if (values && values instanceof Array) {
			values = values.map(value => {
				if (typeof value !== "object") {
					value = { value: value, text: value };
				} else if (value instanceof Array) {
					value = {
						value: value[0],
						text: value.length > 1 ? value[1] : value[0]
					};
				}
				return value;
			});
		}

		return values;
	}
}

// Value save/swap utilities
export function saveValue(input) {
	savedValues.set(input, input.value);
	statusMessage(`${input.value}: value saved.`);
}

export function swapValues(input) {
	if (savedValues.has(input)) {
		const old = savedValues.get(input);
		savedValues.set(input, input.value);
		input.value = old;
		statusMessage(old);
	} else {
		statusMessage(`No saved value; press Ctrl+Enter to save.`);
	}
}

// Keyboard shortcut utilities
export function getKey(input) {
	const root = getShadowRoot();
	if (!root) return;

	const dialog = root.querySelector("#defineKeyDialog");
	if (!dialog) return;

	const ok = dialog.querySelector(".ok");
	const closeButton = dialog.querySelector(".close");

	dialog.removeAttribute("hidden");
	dialog.querySelector(".control").focus();

	closeButton.addEventListener("click", close);
	ok.addEventListener("click", () => {
		dialog.setAttribute("hidden", "true");
		const text = keyToText({
			ctrlKey: dialog.querySelector(".control").checked,
			altKey: dialog.querySelector(".alt").checked,
			shiftKey: dialog.querySelector(".shift").checked,
			key: dialog.querySelector(".key").value
		});
		defineKey(text, input);
		close();
	});

	function close() {
		dialog.setAttribute("hidden", "true");
		input.focus();
	}
}

export function handleUserKey(e) {
	const text = keyToText(eventToKey(e));
	const elements = userKeymap.get(text);
	if (!elements) return false;

	if (elements && elements.length && elements.length > 0) {
		const input = e.target;
		let focus = elements[0];
		if (elements.length > 1) {
			focus = findNextFocus(elements, input);
		}

		if (focus) {
			focus.focus();
			e.preventDefault();
			return true;
		}
	}

	return false;

	function findNextFocus(list, item) {
		const index = list.indexOf(item);
		if (index < 0) return list[0];
		else if (index === list.length - 1) return list[0];
		else return list[index + 1];
	}
}

export function defineKey(text, element) {
	if (!text || !element) return;
	text = normalizeKeyText(text);
	let elements = userKeymap.get(text);

	if (elements) elements.push(element);
	else elements = [element];
	userKeymap.set(text, elements);
}

export function textToKey(text) {
	let t = text.split(" ").map(x => x.trim());
	if (t.length === 1) t = `alt shift ${t[0]}`.split(" ");

	const key = {};
	key.ctrlKey = t.includes("control") || t.includes("ctrl");
	key.altKey = t.includes("alt");
	key.shiftKey = t.includes("shift");
	key.key = t[t.length - 1];

	if (!key.key) {
		throw new Error(`textToKey: ${text} is an invalid key descriptor; character must be last component as in "control shift x"`);
	} else if (key.key.toLowerCase() === "space") {
		key.key = " ";
	} else if (key.key.toLowerCase() === "enter") {
		key.key = "Enter";
	} else {
		key.key = key.key.substr(0, 1).toLowerCase();
	}
	return key;
}

export function keyToText(key) {
	let text = "";
	if (key.ctrlKey) text += "control ";
	if (key.altKey) text += "alt ";
	if (key.shiftKey) text += "shift ";
	if (key.key) text += key.key.toLowerCase();
	return text.trim();
}

export function normalizeKeyText(text) {
	return keyToText(textToKey(text));
}

function compareKeys(k1, k2) {
	return (
		k1.ctrlKey === k2.ctrlKey &&
		k1.altKey === k2.altKey &&
		k1.shiftKey === k2.shiftKey &&
		k1.key.toLowerCase() === k2.key.toLowerCase()
	);
}

function eventToKey(e) {
	return { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key };
}

export function isModifierKey(key) {
	return key === "Control" || key === "Alt" || key === "Shift";
}

export function hasModifierKeys(e) {
	return e.ctrlKey || e.altKey || e.shiftKey;
}

function allowedUnmodified(key) {
	const allowed = "Enter, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Delete, Backspace"
		.split(",").map(x => x.trim());
	return allowed.includes(key);
}

export function parseNumber(value) {
	const val = String(value).split(":");
	if (val.length === 2) {
		return { type: val[0], value: Number(val[1]) };
	} else if (val.length === 1) {
		return Number(value);
	} else {
		statusMessage(`ui-number: bad value - ${value}`);
		return {};
	}
}
