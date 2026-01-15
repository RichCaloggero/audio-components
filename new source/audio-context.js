// audio-context.js
// Native Web Component for the root audio-context element
// Replaces Polymer-based _AudioContext_ module

import { bufferToWave } from "./bufferToWave.js";
import {
	AudioComponentBase,
	getAudio,
	setAudio,
	getShadowRoot,
	setShadowRoot,
	startAutomation,
	stopAutomation,
	addToAutomationQueue,
	removeFromAutomationQueue,
	getAutomationInterval,
	setAutomationInterval,
	statusMessage,
	setParam,
	childrenReady,
	depth
} from "./audio-component-base.js";

// Re-export utilities for other modules
export {
	getAudio as audio,
	getShadowRoot as shadowRoot,
	startAutomation,
	stopAutomation,
	addToAutomationQueue,
	removeFromAutomationQueue,
	statusMessage,
	setParam as _setParam,
	childrenReady,
	depth
};

let audioPlayer = null;
export function registerAudioPlayer(x) {
	if (x) audioPlayer = x;
	return audioPlayer;
}

let instanceCount = 0;

class AudioContext extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'sample-rate', 'enable-automation', 'automation-interval',
			'enable-analyser', 'show-listener', 'record-mode',
			'listener-x', 'listener-y', 'listener-z',
			'forward-x', 'forward-y', 'forward-z',
			'up-x', 'up-y', 'up-z',
			'shortcuts'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this._id = this.getAttribute("id");
		this.id = `audio-context-${instanceCount}`;

		// Additional properties for audio-context
		this._enableAutomation = false;
		this._enableAnalyser = false;
		this._showListener = false;
		this._recordMode = false;
		this._automationInterval = 0.05;

		// Listener properties
		this._listenerX = 0;
		this._listenerY = 0;
		this._listenerZ = 0;
		this._forwardX = 0;
		this._forwardY = 0;
		this._forwardZ = -1;
		this._upX = 0;
		this._upY = 1;
		this._upZ = 0;

		this._shortcuts = '';
		this.analyser = null;
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h1, legend h2, legend h3 { margin: 0; font-size: 1.2em; }
				#statusMessage { margin-top: 1em; padding: 0.5em; background: #f5f5f5; min-height: 1.5em; }
				.recorder[hidden], #listener[hidden] { display: none; }
			</style>
			<fieldset class="audio-context">
				<legend><h1>${this._label}</h1></legend>
				<ui-boolean label="enable automation" shortcut="alt shift a"></ui-boolean>
				<ui-number label="automationInterval" min="0.01" max="3.0" step="0.01"></ui-number>
				<ui-boolean label="enable analyser" shortcut="alt shift x"></ui-boolean>
				<ui-boolean label="showListener"></ui-boolean>
				<ui-boolean label="enable record mode" class="enable-record-mode"></ui-boolean>

				<fieldset class="recorder" hidden>
					<legend><h2>Recorder</h2></legend>
					<div id="results-label">Results - right click and choose save from the context menu:</div>
					<audio controls tabindex="0" aria-labelledby="results-label"></audio>
				</fieldset>

				<fieldset hidden id="listener">
					<legend><h3>Listener</h3></legend>
					<ui-number label="x"></ui-number>
					<ui-number label="y"></ui-number>
					<ui-number label="z"></ui-number>
					<ui-number label="forwardX"></ui-number>
					<ui-number label="forwardY"></ui-number>
					<ui-number label="forwardZ"></ui-number>
					<ui-number label="upX"></ui-number>
					<ui-number label="upY"></ui-number>
					<ui-number label="upZ"></ui-number>
				</fieldset>

				<div role="region" aria-label="status" id="statusMessage" aria-live="polite"></div>
			</fieldset>

			<slot></slot>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		// Store shadow root for audio-context
		setShadowRoot(this.shadowRoot);

		// Restore original ID if provided
		if (this._id) this.id = this._id;

		// Wait for children and set up
		childrenReady(this, children => {
			this._enumerateNonUi()
				.forEach(e => e.depth = depth(e));
		});

		console.log(`audio-context connected with label ${this._label}`);
	}

	_setupEventListeners() {
		// Enable automation checkbox
		const enableAutomationEl = this.shadowRoot.querySelector('ui-boolean[label="enable automation"]');
		if (enableAutomationEl) {
			enableAutomationEl.value = this._enableAutomation;
			enableAutomationEl.addEventListener('value-changed', (e) => {
				this.enableAutomation = e.detail.value;
			});
		}

		// Automation interval
		const automationIntervalEl = this.shadowRoot.querySelector('ui-number[label="automationInterval"]');
		if (automationIntervalEl) {
			automationIntervalEl.value = this._automationInterval;
			automationIntervalEl.addEventListener('value-changed', (e) => {
				this.automationInterval = e.detail.value;
			});
		}

		// Enable analyser
		const enableAnalyserEl = this.shadowRoot.querySelector('ui-boolean[label="enable analyser"]');
		if (enableAnalyserEl) {
			enableAnalyserEl.value = this._enableAnalyser;
			enableAnalyserEl.addEventListener('value-changed', (e) => {
				this.enableAnalyser = e.detail.value;
			});
		}

		// Show listener
		const showListenerEl = this.shadowRoot.querySelector('ui-boolean[label="showListener"]');
		if (showListenerEl) {
			showListenerEl.value = this._showListener;
			showListenerEl.addEventListener('value-changed', (e) => {
				this.showListener = e.detail.value;
			});
		}

		// Record mode
		const recordModeEl = this.shadowRoot.querySelector('ui-boolean[label="enable record mode"]');
		if (recordModeEl) {
			recordModeEl.value = this._recordMode;
			recordModeEl.addEventListener('value-changed', (e) => {
				this.recordMode = e.detail.value;
			});
		}

		// Listener position controls
		this._setupListenerControls();
	}

	_setupListenerControls() {
		const listenerControls = [
			{ label: 'x', prop: '_listenerX', handler: 'listenerX' },
			{ label: 'y', prop: '_listenerY', handler: 'listenerY' },
			{ label: 'z', prop: '_listenerZ', handler: 'listenerZ' },
			{ label: 'forwardX', prop: '_forwardX', handler: 'forwardX' },
			{ label: 'forwardY', prop: '_forwardY', handler: 'forwardY' },
			{ label: 'forwardZ', prop: '_forwardZ', handler: 'forwardZ' },
			{ label: 'upX', prop: '_upX', handler: 'upX' },
			{ label: 'upY', prop: '_upY', handler: 'upY' },
			{ label: 'upZ', prop: '_upZ', handler: 'upZ' }
		];

		const listenerFieldset = this.shadowRoot.querySelector('#listener');
		if (listenerFieldset) {
			listenerControls.forEach(ctrl => {
				const el = listenerFieldset.querySelector(`ui-number[label="${ctrl.label}"]`);
				if (el) {
					el.value = this[ctrl.prop];
					el.addEventListener('value-changed', (e) => {
						this[ctrl.handler] = e.detail.value;
					});
				}
			});
		}
	}

	// Enable automation property
	get enableAutomation() { return this._enableAutomation; }
	set enableAutomation(value) {
		this._enableAutomation = Boolean(value);
		if (this._ready) {
			if (this._enableAutomation) {
				startAutomation();
				this.dispatchEvent(new CustomEvent("startAutomation", { detail: { interval: getAutomationInterval() } }));
			} else {
				stopAutomation();
				this.dispatchEvent(new CustomEvent("stopAutomation"));
			}
		}
	}

	// Automation interval property
	get automationInterval() { return this._automationInterval; }
	set automationInterval(value) {
		this._automationInterval = Number(value);
		setAutomationInterval(this._automationInterval);
	}

	// Enable analyser property
	get enableAnalyser() { return this._enableAnalyser; }
	set enableAnalyser(value) {
		this._enableAnalyser = Boolean(value);
		if (this._ready && audioPlayer) {
			if (this._enableAnalyser) {
				// Create analyser if needed
				this.analyser = this.audio.createAnalyser();
				audioPlayer.output?.connect(this.analyser);
			} else {
				this.analyser = null;
			}
		}
	}

	// Show listener property
	get showListener() { return this._showListener; }
	set showListener(value) {
		this._showListener = Boolean(value);
		const listenerEl = this.shadowRoot?.querySelector("#listener");
		if (listenerEl) {
			listenerEl.hidden = !this._showListener;
		}
	}

	// Record mode property
	get recordMode() { return this._recordMode; }
	set recordMode(value) {
		this._recordMode = Boolean(value);
		const recorder = this.shadowRoot?.querySelector(".recorder");
		if (recorder) {
			if (this._recordMode) {
				recorder.removeAttribute("hidden");
				if (audioPlayer?.src) {
					this.loadAudio(audioPlayer.src);
				}
			} else {
				recorder.setAttribute("hidden", "");
			}
		}
	}

	// Listener position properties
	get listenerX() { return this._listenerX; }
	set listenerX(value) {
		this._listenerX = Number(value);
		if (this._ready) this._updateListenerPosition();
	}

	get listenerY() { return this._listenerY; }
	set listenerY(value) {
		this._listenerY = Number(value);
		if (this._ready) this._updateListenerPosition();
	}

	get listenerZ() { return this._listenerZ; }
	set listenerZ(value) {
		this._listenerZ = Number(value);
		if (this._ready) this._updateListenerPosition();
	}

	_updateListenerPosition() {
		this.audio.listener.setPosition(this._listenerX, this._listenerY, this._listenerZ);
	}

	// Listener orientation properties
	get forwardX() { return this._forwardX; }
	set forwardX(value) {
		this._forwardX = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	get forwardY() { return this._forwardY; }
	set forwardY(value) {
		this._forwardY = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	get forwardZ() { return this._forwardZ; }
	set forwardZ(value) {
		this._forwardZ = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	get upX() { return this._upX; }
	set upX(value) {
		this._upX = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	get upY() { return this._upY; }
	set upY(value) {
		this._upY = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	get upZ() { return this._upZ; }
	set upZ(value) {
		this._upZ = Number(value);
		if (this._ready) this._updateListenerOrientation();
	}

	_updateListenerOrientation() {
		this.audio.listener.setOrientation(
			this._forwardX, this._forwardY, this._forwardZ,
			this._upX, this._upY, this._upZ
		);
	}

	// Shortcuts property
	get shortcuts() { return this._shortcuts; }
	set shortcuts(value) {
		this._shortcuts = value || '';
		if (this._ready && value) {
			this._parseAndApplyShortcuts(value);
		}
	}

	_parseAndApplyShortcuts(value) {
		const parameters = Array.from(this.shadowRoot.querySelectorAll("ui-number, ui-boolean, ui-text, ui-list"));
		const shortcuts = this._parseShortcuts(value);

		parameters.forEach(p => {
			const name = p.name || p.label;
			if (name) {
				const shortcut = shortcuts.find(x => x.parameter.toLowerCase() === name.toLowerCase());
				if (shortcut) {
					p.shortcut = shortcut.shortcut;
				}
			}
		});
	}

	_parseShortcuts(text) {
		return text.split(",").map(definition => {
			const tokens = definition.match(/\w+/g);
			if (tokens.length < 3) {
				throw new Error(`${definition}: invalid shortcut definition`);
			}
			return { parameter: tokens[0], shortcut: tokens.slice(1).join(" ") };
		});
	}

	// Audio loading for recording
	loadAudio(url) {
		statusMessage("Loading...");
		fetch(url)
			.then(response => {
				if (response.ok) return response.arrayBuffer();
				else throw new Error(response.statusText);
			})
			.then(data => {
				const audioContext = new window.AudioContext();
				return audioContext.decodeAudioData(data);
			})
			.then(buffer => {
				this.render(buffer);
				statusMessage(`${Math.round(buffer.duration / 60 * 10) / 10} minutes of audio loaded.`);
			})
			.catch(error => statusMessage(error.toString()));
	}

	// Enumerate all non-UI elements
	_enumerateAll(root) {
		return [
			root,
			Array.from(root.children).map(x => this._enumerateAll(x)),
			root.shadowRoot ? this._enumerateAll(root.shadowRoot) : []
		].flat(Infinity);
	}

	_enumerateNonUi() {
		return this._enumerateAll(this)
			.filter(x => x instanceof AudioComponentBase);
	}
}

customElements.define('audio-context', AudioContext);

export { AudioContext };
export { AudioComponentBase } from "./audio-component-base.js";
