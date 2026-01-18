// ui.js
// Native Web Component base class for UI elements
// Replaces Polymer-based UI class

import { getShadowRoot, statusMessage, not } from "./audio-component-base.js";

const savedValues = new Map();
const userKeymap = new Map();

// ============================================================================
// Table-Driven Keyboard Bindings
// ============================================================================
// Global keymap: component tag name → (normalized key string → binding object)
// Binding object: { handler: "methodName", args?: [...], description: "..." }
// ============================================================================

const keyBindings = new Map([
	["ui-number", new Map([
		["control Home", { handler: "setMax", description: "set to maximum" }],
		["control End", { handler: "setMin", description: "set to minimum" }],
		["PageUp", { handler: "increase", args: [10], description: "increase by 10 steps" }],
		["PageDown", { handler: "decrease", args: [10], description: "decrease by 10 steps" }],
		["control -", { handler: "negate", description: "negate value" }],
	])],
	["ui-position", new Map([
		["ArrowRight", { handler: "adjustAxis", args: [0, 1], description: "move right (X+)" }],
		["ArrowLeft", { handler: "adjustAxis", args: [0, -1], description: "move left (X-)" }],
		["ArrowUp", { handler: "adjustAxis", args: [2, 1], description: "move forward (Z+)" }],
		["ArrowDown", { handler: "adjustAxis", args: [2, -1], description: "move backward (Z-)" }],
		["u", { handler: "adjustAxis", args: [1, 1], description: "move up (Y+)" }],
		["d", { handler: "adjustAxis", args: [1, -1], description: "move down (Y-)" }],
	])],
	// ui-boolean, ui-text, ui-list: no entries (native input handles all)
]);

// Normalize keyboard event to lookup string
function eventToKeyString(e) {
	const parts = [];
	if (e.ctrlKey) parts.push("control");
	if (e.altKey) parts.push("alt");
	if (e.shiftKey) parts.push("shift");
	// Edge case: space key represented as word "space"
	const key = e.key === " " ? "space" : e.key;
	parts.push(key);
	return parts.join(" ");
} // eventToKeyString

// Find UI component from event path (handles shadow DOM)
function findComponent(e) {
	const path = e.composedPath();
	return path.find(el => el.tagName?.toLowerCase().startsWith("ui-")) || null;
} // findComponent

// Document-level keyboard handler
function handleKeydown(e) {
	const component = findComponent(e);
	if (not(component)) return; // Not in a UI component

	// 1. System shortcuts first (Ctrl+Space, Ctrl+Enter, user shortcuts)
	if (not(handleSpecialKeys(component, e))) {
		return; // System shortcut handled
	} // if

	// 2. Component-specific bindings
	const keyString = eventToKeyString(e);
	const componentBindings = keyBindings.get(component.tagName.toLowerCase());
	if (componentBindings) {
		const binding = componentBindings.get(keyString);
		if (binding && typeof component[binding.handler] === "function") {
			component[binding.handler](...(binding.args || []));
			e.preventDefault();
			return;
		} // if binding
	} // if componentBindings

	// 3. Unmatched - native input handles it
} // handleKeydown

// Establish document-level handler on module load
document.addEventListener("keydown", handleKeydown, true); // Capture phase

// Handle system shortcuts (Ctrl+Space, Ctrl+Enter, user shortcuts)
// Returns false if handled, true if unhandled (pass through)
function handleSpecialKeys(component, e) {
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
			} // if ctrl
			break; // case space

		case "Enter":
			if (e.ctrlKey && e.altKey && e.shiftKey) {
				getKey(input);
			} else if (e.ctrlKey) {
				saveValue(input);
			} else {
				return true;
			} // if modifiers
			break; // case Enter

		default:
			return true;
	} // switch key

	e.preventDefault();
	return false;
} // handleSpecialKeys

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
	} // get observedAttributes

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this._label = '';
		this._name = '';
		this._value = null;
		this._shortcut = '';
		this.defaultModifiers = 'alt shift';
		this.uiElement = null;
	} // constructor

	// Template to render - subclasses override this
	get template() {
		return `<slot></slot>`;
	} // get template

	connectedCallback() {
		this.render();
		this.uiElement = this.shadowRoot.querySelector("#input");

		if (this._shortcut && this.uiElement) {
			defineKey(this._shortcut, this.uiElement);
		} // if shortcut
	} // connectedCallback

	render() {
		this.shadowRoot.innerHTML = this.template;
		this._setupEventListeners();
	} // render

	// Override in subclasses to set up event listeners
	_setupEventListeners() {}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'label':
				this._label = newValue || '';
				this._updateLabel();
				break; // case label
			case 'name':
				this._name = newValue || '';
				break; // case name
			case 'value':
				this.value = newValue;
				break; // case value
			case 'shortcut':
				this._shortcut = newValue || '';
				if (this._shortcut && this.uiElement) {
					defineKey(this._shortcut, this.uiElement);
				} // if shortcut
				break; // case shortcut
		} // switch name
	} // attributeChangedCallback

	// Label property
	get label() { return this._label; }
	set label(value) {
		this._label = value || '';
		this._updateLabel();
	} // set label

	_updateLabel() {
		const labelEl = this.shadowRoot.querySelector("label");
		if (labelEl) labelEl.textContent = this._label;
	} // _updateLabel

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
		} // if changed
	} // set value

	// Shortcut property
	get shortcut() { return this._shortcut; }
	set shortcut(value) {
		this._shortcut = value || '';
		if (this._shortcut && this.uiElement) {
			defineKey(this._shortcut, this.uiElement);
		} // if shortcut
	} // set shortcut

	// Dispatch value-changed event
	_notifyValueChange(value) {
		this.dispatchEvent(new CustomEvent('value-changed', {
			detail: { value, name: this.name },
			bubbles: true,
			composed: true
		}));
	} // _notifyValueChange

	// Legacy method - delegates to module function
	// Kept for backwards compatibility with subclass calls
	handleSpecialKeys(e) {
		return handleSpecialKeys(this, e);
	} // handleSpecialKeys

	// Process values for list controls
	static processValues(values) {
		if (values instanceof String || typeof values === "string") {
			values = values.trim();
			if (values.charAt(0) !== "[" && values.includes(",") && not(values.includes('"'))) {
				return values.split(",").map(value => value.trim());
			} else {
				try {
					values = JSON.parse(values);
				} catch (e) {
					values = [];
				} // try
			} // if comma-separated
		} // if string

		if (values && values instanceof Array) {
			values = values.map(value => {
				if (typeof value !== "object") {
					value = { value: value, text: value };
				} else if (value instanceof Array) {
					value = {
						value: value[0],
						text: value.length > 1 ? value[1] : value[0]
					};
				} // if type
				return value;
			}); // map
		} // if array

		return values;
	} // processValues
} // class UIBase

// Value save/swap utilities
export function saveValue(input) {
	savedValues.set(input, input.value);
	statusMessage(`${input.value}: value saved.`);
} // saveValue

export function swapValues(input) {
	if (savedValues.has(input)) {
		const old = savedValues.get(input);
		savedValues.set(input, input.value);
		input.value = old;
		statusMessage(old);
	} else {
		statusMessage(`No saved value; press Ctrl+Enter to save.`);
	} // if has saved
} // swapValues

// Keyboard shortcut utilities
export function getKey(input) {
	const root = getShadowRoot();
	if (not(root)) return;

	const dialog = root.querySelector("#defineKeyDialog");
	if (not(dialog)) return;

	const ok = dialog.querySelector(".ok");
	const closeButton = dialog.querySelector(".close");
	const keyInput = dialog.querySelector(".key");

	// Clear previous key value
	keyInput.value = "";

	dialog.showModal();
	keyInput.focus();

	function close() {
		dialog.close();
		input.focus();
	} // close

	function handleOk() {
		const text = keyToText({
			ctrlKey: dialog.querySelector(".control").checked,
			altKey: dialog.querySelector(".alt").checked,
			shiftKey: dialog.querySelector(".shift").checked,
			key: keyInput.value
		});
		if (keyInput.value) {
			defineKey(text, input);
			statusMessage(`Shortcut "${text}" defined.`);
		} // if key
		close();
	} // handleOk

	// Use once option to avoid duplicate listeners
	closeButton.addEventListener("click", close, { once: true });
	ok.addEventListener("click", handleOk, { once: true });
	// Native dialog handles Escape key automatically
} // getKey

export function handleUserKey(e) {
	const text = keyToText(eventToKey(e));
	const elements = userKeymap.get(text);
	if (not(elements)) return false;

	if (elements && elements.length && elements.length > 0) {
		const input = e.target;
		let focus = elements[0];
		if (elements.length > 1) {
			focus = findNextFocus(elements, input);
		} // if multiple

		if (focus) {
			focus.focus();
			e.preventDefault();
			return true;
		} // if focus
	} // if elements

	return false;

	function findNextFocus(list, item) {
		const index = list.indexOf(item);
		if (index < 0) return list[0];
		else if (index === list.length - 1) return list[0];
		else return list[index + 1];
	} // findNextFocus
} // handleUserKey

export function defineKey(text, element) {
	if (not(text) || not(element)) return;
	text = normalizeKeyText(text);
	let elements = userKeymap.get(text);

	if (elements) elements.push(element);
	else elements = [element];
	userKeymap.set(text, elements);
} // defineKey

export function textToKey(text) {
	let t = text.split(" ").map(x => x.trim());
	if (t.length === 1) t = `alt shift ${t[0]}`.split(" ");

	const key = {};
	key.ctrlKey = t.includes("control") || t.includes("ctrl");
	key.altKey = t.includes("alt");
	key.shiftKey = t.includes("shift");
	key.key = t[t.length - 1];

	if (not(key.key)) {
		throw new Error(`textToKey: ${text} is an invalid key descriptor; character must be last component as in "control shift x"`);
	} else if (key.key.toLowerCase() === "space") {
		key.key = " ";
	} else if (key.key.toLowerCase() === "enter") {
		key.key = "Enter";
	} else {
		key.key = key.key.substr(0, 1).toLowerCase();
	} // if key type
	return key;
} // textToKey

export function keyToText(key) {
	let text = "";
	if (key.ctrlKey) text += "control ";
	if (key.altKey) text += "alt ";
	if (key.shiftKey) text += "shift ";
	if (key.key) text += key.key.toLowerCase();
	return text.trim();
} // keyToText

export function normalizeKeyText(text) {
	return keyToText(textToKey(text));
} // normalizeKeyText

function eventToKey(e) {
	return { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key };
} // eventToKey

export function isModifierKey(key) {
	return key === "Control" || key === "Alt" || key === "Shift";
} // isModifierKey

export function hasModifierKeys(e) {
	return e.ctrlKey || e.altKey || e.shiftKey;
} // hasModifierKeys

// Get all registered shortcuts for help dialog
export function getRegisteredShortcuts() {
	const shortcuts = [];
	for (const [keyText, elements] of userKeymap) {
		for (const el of elements) {
			// Find the parent UI component to get its label
			const uiParent = el.getRootNode()?.host;
			const label = uiParent?.label || el.getAttribute('aria-label') || 'Unknown';
			shortcuts.push({ shortcut: keyText, label });
		} // for el
	} // for keyText
	return shortcuts;
} // getRegisteredShortcuts

// Format shortcut text for display (e.g., "alt shift a" → "Alt + Shift + A")
export function formatShortcutForDisplay(text) {
	return text.split(' ')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' + ');
} // formatShortcutForDisplay
