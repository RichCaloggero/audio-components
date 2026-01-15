// audio-component-base.js
// Native Web Component base class for all audio elements
// Replaces Polymer's PolymerElement

let audio = null;
let shadowRoot = null;
let automationInterval = 0.070; // seconds
let automationQueue = [];
let automator = null;

// Shared AudioContext getter/setter
export function getAudio() {
	if (!audio) {
		audio = new AudioContext();
	}
	return audio;
}

export function setAudio(ctx) {
	audio = ctx;
}

export function getShadowRoot() {
	return shadowRoot;
}

export function setShadowRoot(root) {
	if (!shadowRoot) shadowRoot = root;
}

// Automation functions
export function startAutomation() {
	automator = setInterval(() => automationQueue.forEach(e => e.automate()), 1000 * automationInterval);
}

export function stopAutomation() {
	clearInterval(automator);
	automator = null;
}

export function addToAutomationQueue(element) {
	automationQueue.push(element);
	console.debug(`added ${element.label || element.id} to automation queue`);
}

export function removeFromAutomationQueue(element) {
	automationQueue = automationQueue.filter(e => e !== element);
}

export function getAutomationInterval() {
	return automationInterval;
}

export function setAutomationInterval(value) {
	if (value && !Number.isNaN(value)) automationInterval = value;
}

// Status message utility
export function statusMessage(message, log = true) {
	const p = document.createElement("p");
	p.appendChild(document.createTextNode(message));
	if (shadowRoot) {
		const status = shadowRoot.querySelector("#statusMessage");
		if (status) {
			if (!log) status.innerHTML = "";
			status.appendChild(p);
			return;
		}
	}
	console.log(message);
}

// Set audio parameter with optional ramping
export function setParam(parameter, value) {
	if (!parameter) return;
	try {
		if (parameter instanceof AudioParam) {
			if (automator) parameter.linearRampToValueAtTime(value, audio.currentTime);
			else parameter.value = value;
		} else {
			parameter = value;
		}
		return parameter;
	} catch (e) {
		console.error(`setParam (${parameter}, ${value}): ${e}`);
	}
}

/**
 * Wait for all children to be ready before proceeding.
 *
 * This is critical for container elements (audio-series, audio-parallel, etc.)
 * that need all child audio components to be fully initialized before they
 * can connect them in the audio graph.
 *
 * The pattern works as follows:
 * 1. Container element calls childrenReady() in connectedCallback
 * 2. childrenReady listens for 'elementReady' events bubbling from children
 * 3. Each child element sets isReady=true when its component is fully built
 * 4. Setting isReady=true triggers signalReady() on the next event loop pass
 * 5. signalReady dispatches 'elementReady' event that bubbles up
 * 6. When all children have signaled ready, callback is invoked
 * 7. Container then builds its component using the child components
 * 8. Container sets isReady=true, signaling to its parent
 *
 * The setTimeout in isReady setter is essential - it ensures that events
 * aren't dropped when signalReady is called directly from the setter.
 *
 * @param {HTMLElement} element - The container element waiting for children
 * @param {Function} callback - Called with array of children when all are ready
 */
export function childrenReady(element, callback) {
	let children = Array.from(element.children).filter(child =>
		// Only wait for audio component children, not text nodes or other elements
		child instanceof AudioComponentBase
	);

	if (children.length === 0) {
		// No audio component children - we're ready immediately
		// Use setTimeout to ensure consistent async behavior
		setTimeout(() => {
			callback.call(element, []);
			element.isReady = true;
		}, 0);
		return;
	}

	element.addEventListener("elementReady", handleChildReady);
	console.debug(`${element.id}: waiting for ${children.length} children`);

	function handleChildReady(e) {
		// Only handle events from direct children
		if (!children.includes(e.target)) return;

		// Stop propagation to prevent parent from processing this event
		e.stopPropagation();

		children = children.filter(x => x !== e.target);
		console.debug(`${element.id}: child ${e.target.id} is ready; ${children.length} remaining`);
		if (children.length > 0) return;

		// All children ready - clean up listener and invoke callback
		element.removeEventListener("elementReady", handleChildReady);
		callback.call(element, Array.from(element.children).filter(child =>
			child instanceof AudioComponentBase
		));
		element.isReady = true;
	}
}

// Signal that element is ready
function signalReady(element) {
	element.dispatchEvent(new CustomEvent("elementReady", { bubbles: true }));
}

// Calculate depth in the component tree
export function depth(start) {
	let e = start;
	let _depth = 1;
	while (e && !e.matches("audio-context")) {
		if (!e.container || e.label) _depth += 1;
		e = e.parentElement;
	}
	return _depth;
}

// Instance counter for unique IDs
const instanceCounts = {};
function getInstanceId(tagName) {
	if (!instanceCounts[tagName]) instanceCounts[tagName] = 0;
	instanceCounts[tagName]++;
	return `${tagName}-${instanceCounts[tagName]}`;
}

/**
 * Base class for all audio component elements
 * Provides:
 * - Shadow DOM with template rendering
 * - Reactive properties via getters/setters
 * - Attribute reflection
 * - Ready lifecycle management
 * - UI hide/show utilities
 */
export class AudioComponentBase extends HTMLElement {
	// Subclasses should override this
	static get observedAttributes() {
		return ['label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this._id = this.getAttribute("id");
		this.id = getInstanceId(this.tagName.toLowerCase());
		this._ready = false;
		this._hide = [];

		// Default property values
		this._label = '';
		this._bypass = false;
		this._mix = 1.0;
		this._silentBypass = false;
		this._hideOnBypass = false;
		this._depth = 1;

		// Get shared audio context
		this.audio = getAudio();

		// Component reference (set by subclasses)
		this.component = null;

		// Container flag (for series/parallel)
		this.container = false;
	}

	// Template to render - subclasses override this
	get template() {
		return `<slot></slot>`;
	}

	connectedCallback() {
		// Restore original ID if provided
		if (this._id) this.id = this._id;

		// Store shadow root reference for audio-context
		if (this.tagName.toLowerCase() === 'audio-context') {
			setShadowRoot(this.shadowRoot);
		}

		// Render template
		this.render();

		// Calculate depth
		this._depth = depth(this);

		// Handle UI visibility
		if (this.label) {
			this.restoreUI();
			this.hideOnly(this._hide);
		} else {
			this.hideUI();
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

		// Convert attribute name to property name (kebab-case to camelCase)
		const propName = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

		// Handle special cases
		switch (name) {
			case 'hide':
				this.hide = newValue;
				break;
			case 'bypass':
			case 'silent-bypass':
			case 'hide-on-bypass':
				this[propName] = newValue !== null;
				break;
			default:
				this[propName] = newValue;
		}
	}

	// Ready state management
	get isReady() { return this._ready; }
	set isReady(value) {
		if (value) {
			this._ready = true;
			// Run property effects after ready
			setTimeout(() => this._runPropertyEffects(), 0);
			setTimeout(() => signalReady(this), 0);
		} else {
			this._ready = false;
		}
	}

	_runPropertyEffects() {
		// Subclasses can override to run observers after ready
	}

	// Label property
	get label() { return this._label; }
	set label(value) {
		this._label = value || '';
		if (this._ready) {
			if (value) {
				this.restoreUI();
			} else {
				this.hideUI();
			}
		}
		this._updateLegend();
	}

	_updateLegend() {
		const legend = this.shadowRoot.querySelector('legend h1, legend h2, legend h3');
		if (legend) {
			legend.textContent = this._label;
			legend.setAttribute('aria-level', this._depth);
		}
	}

	// Depth property
	get depth() { return this._depth; }
	set depth(value) {
		this._depth = value;
		this._updateLegend();
	}

	// Hide property (comma-separated list of field names to hide)
	get hide() { return this._hide; }
	set hide(value) {
		this._hide = value ? value.trim().toLowerCase().match(/\w+/g) || [] : [];
		if (this._ready) {
			this.hideOnly(this._hide);
		}
	}

	// Bypass property
	get bypass() { return this._bypass; }
	set bypass(value) {
		this._bypass = Boolean(value);
		if (this._ready && this.component) {
			this.component.silentBypass(this._silentBypass);
			this.component.bypass(this._bypass);
			this._handleHideOnBypass(this._bypass);
		}
	}

	// Silent bypass property
	get silentBypass() { return this._silentBypass; }
	set silentBypass(value) {
		this._silentBypass = Boolean(value);
	}

	// Hide on bypass property
	get hideOnBypass() { return this._hideOnBypass; }
	set hideOnBypass(value) {
		this._hideOnBypass = Boolean(value);
	}

	_handleHideOnBypass(bypassed) {
		if (this._ready && this.label && this.findContext()?.hideOnBypass) {
			const slot = this.shadowRoot.querySelector("slot");
			if (bypassed) {
				this.hideAllExcept(["bypass"]);
				if (slot) slot.hidden = true;
			} else {
				this.hideOnly(this._hide);
				if (slot) slot.hidden = false;
			}
		}
	}

	// Mix property
	get mix() { return this._mix; }
	set mix(value) {
		this._mix = Number(value);
		if (this._ready && this.component) {
			this.component.mix(this._mix);
		}
	}

	// UI visibility utilities
	uiRoot() {
		return this.shadowRoot ?
			Array.from(this.shadowRoot.children).filter(x => !x.matches("slot, style")) : [];
	}

	uiControls() {
		if (this.shadowRoot) {
			const selectors = ".panel,ui-list,ui-text,ui-number,ui-boolean,button";
			return Array.from(this.shadowRoot.querySelectorAll(selectors));
		}
		return [];
	}

	hideOnly(...labels) {
		const hide = labels.flat(Infinity);
		this.uiControls().forEach(x => {
			const label = x.label ? x.label.trim().toLowerCase() : "";
			x.hidden = hide.includes(label.toLowerCase());
		});
	}

	hideAllExcept(...labels) {
		const show = labels.flat(Infinity);
		this.uiControls().forEach(x => {
			const label = x.label ? x.label.trim().toLowerCase() : "";
			x.hidden = !show.includes(label);
		});
	}

	restoreUI() {
		this.uiRoot().forEach(x => x.hidden = false);
		const slot = this.shadowRoot.querySelector("slot");
		if (slot) slot.removeAttribute("hidden");
	}

	hideUI(includeDescendents) {
		this.uiRoot().forEach(x => x.hidden = true);
		if (includeDescendents) {
			const slot = this.shadowRoot.querySelector("slot");
			if (slot) slot.hidden = true;
		}
	}

	hidePanel(selector) {
		if (this.shadowRoot) {
			this.shadowRoot.querySelectorAll(selector).forEach(x => x.hidden = true);
		}
	}

	showPanel(selector) {
		if (this.shadowRoot) {
			this.shadowRoot.querySelectorAll(selector).forEach(x => x.hidden = false);
		}
	}

	labelsToControls(...labels) {
		return this.uiControls().filter(x => labels.includes(x.label));
	}

	// Find the audio-context ancestor
	findContext() {
		let element = this;
		while (element && element.tagName.toLowerCase() !== 'audio-context') {
			element = element.parentElement;
		}
		return element;
	}

	// Get components from child elements
	components(elements) {
		if (!elements) elements = [];
		return elements.map(e => {
			if (e && e.component) return e.component;
			else throw new Error(`${this.id}: ${e} is null or invalid -- cannot connect`);
		});
	}

	// Dispatch custom event for property changes
	_notifyPropertyChange(name, value) {
		this.dispatchEvent(new CustomEvent(`${name}-changed`, {
			detail: { value },
			bubbles: true,
			composed: true
		}));
	}

	// Update UI element with new value
	_updateUI(label, value) {
		const control = this.shadowRoot.querySelector(`ui-number[label="${label}"], ui-boolean[label="${label}"], ui-list[label="${label}"], ui-text[label="${label}"]`);
		if (control && control.value !== value) {
			control.value = value;
		}
	}
}
