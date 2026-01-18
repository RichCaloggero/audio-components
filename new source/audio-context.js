// audio-context.js
// Native Web Component for the root audio-context element
// Replaces Polymer-based _AudioContext_ module

import { bufferToWave } from "./bufferToWave.js";
import { getRegisteredShortcuts, formatShortcutForDisplay } from "./ui.js";
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
	depth,
	not
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
} // registerAudioPlayer

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
	} // get observedAttributes

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
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h1, legend h2, legend h3 { margin: 0; font-size: 1.2em; }
				#statusMessage { margin-top: 1em; padding: 0.5em; background: #f5f5f5; min-height: 1.5em; }
				.recorder[hidden], #listener[hidden] { display: none; }

				/* Native dialog element styling */
				#helpDialog {
					border: 1px solid #333;
					border-radius: 8px;
					padding: 1.5em;
					box-shadow: 0 4px 20px rgba(0,0,0,0.3);
					max-width: 600px;
					max-height: 80vh;
					overflow-y: auto;
				}
				#helpDialog::backdrop { background: rgba(0,0,0,0.5); }
				#helpDialog h2 { margin-top: 0; }
				#helpDialog table { border-collapse: collapse; width: 100%; }
				#helpDialog th, #helpDialog td { text-align: left; padding: 0.4em 0.8em; border-bottom: 1px solid #eee; }
				#helpDialog th { background: #f5f5f5; }
				#helpDialog kbd { background: #eee; padding: 0.2em 0.5em; border-radius: 3px; border: 1px solid #ccc; font-family: monospace; }
				#helpDialog .close-btn { float: right; background: none; border: none; font-size: 1.5em; cursor: pointer; }
				#helpDialog h3 { margin-top: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }

				#defineKeyDialog {
					border: 1px solid #333;
					border-radius: 8px;
					padding: 1.5em;
					box-shadow: 0 4px 20px rgba(0,0,0,0.3);
					min-width: 300px;
				}
				#defineKeyDialog::backdrop { background: rgba(0,0,0,0.5); }
				#defineKeyDialog h3 { margin-top: 0; }
				#defineKeyDialog label { display: block; margin: 0.5em 0; }
				#defineKeyDialog .key { width: 3em; text-align: center; font-size: 1.2em; }
				#defineKeyDialog .buttons { margin-top: 1em; text-align: right; }
				#defineKeyDialog button { margin-left: 0.5em; padding: 0.4em 1em; }
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

			<dialog id="helpDialog" aria-labelledby="helpTitle">
				<button class="close-btn" aria-label="Close">&times;</button>
				<h2 id="helpTitle">Keyboard Shortcuts</h2>

				<h3>Global Shortcuts</h3>
				<table>
					<tr><th>Action</th><th>Shortcut</th></tr>
					<tr><th>Show this help dialog</th><td><kbd>F1</kbd></td></tr>
					<tr><th>Save value to memory</th><td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td></tr>
					<tr><th>Swap with saved value</th><td><kbd>Ctrl</kbd> + <kbd>Space</kbd></td></tr>
					<tr><th>Define custom shortcut for control</th><td><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd></td></tr>
				</table>

				<h3>Number Input Shortcuts</h3>
				<table>
					<tr><th>Action</th><th>Shortcut</th></tr>
					<tr><th>Set to maximum value</th><td><kbd>Ctrl</kbd> + <kbd>Home</kbd></td></tr>
					<tr><th>Set to minimum value</th><td><kbd>Ctrl</kbd> + <kbd>End</kbd></td></tr>
					<tr><th>Increase by 10x step</th><td><kbd>PageUp</kbd></td></tr>
					<tr><th>Decrease by 10x step</th><td><kbd>PageDown</kbd></td></tr>
					<tr><th>Negate current value</th><td><kbd>Ctrl</kbd> + <kbd>-</kbd></td></tr>
				</table>

				<h3>Component Shortcuts</h3>
				<table>
					<tr><th>Action</th><th>Shortcut</th></tr>
					<tbody id="componentShortcuts"></tbody>
				</table>

				<p><em>Press <kbd>Escape</kbd> or <kbd>F1</kbd> to close</em></p>
			</dialog>

			<dialog id="defineKeyDialog" aria-labelledby="defineKeyTitle">
				<h3 id="defineKeyTitle">Define Keyboard Shortcut</h3>
				<label><input type="checkbox" class="control"> Ctrl</label>
				<label><input type="checkbox" class="alt" checked> Alt</label>
				<label><input type="checkbox" class="shift" checked> Shift</label>
				<label>Key: <input type="text" class="key" maxlength="1" value=""></label>
				<div class="buttons">
					<button class="close">Cancel</button>
					<button class="ok">OK</button>
				</div>
			</dialog>

			<slot></slot>
		`;
	} // get template

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
		}); // childrenReady

		console.log(`audio-context connected with label ${this._label}`);
	} // connectedCallback

	_setupEventListeners() {
		// Help dialog setup
		this._setupHelpDialog();

		// Enable automation checkbox
		const enableAutomationEl = this.shadowRoot.querySelector('ui-boolean[label="enable automation"]');
		if (enableAutomationEl) {
			enableAutomationEl.value = this._enableAutomation;
			enableAutomationEl.addEventListener('value-changed', (e) => {
				this.enableAutomation = e.detail.value;
			}); // value-changed
		} // if enableAutomationEl

		// Automation interval
		const automationIntervalEl = this.shadowRoot.querySelector('ui-number[label="automationInterval"]');
		if (automationIntervalEl) {
			automationIntervalEl.value = this._automationInterval;
			automationIntervalEl.addEventListener('value-changed', (e) => {
				this.automationInterval = e.detail.value;
			}); // value-changed
		} // if automationIntervalEl

		// Enable analyser
		const enableAnalyserEl = this.shadowRoot.querySelector('ui-boolean[label="enable analyser"]');
		if (enableAnalyserEl) {
			enableAnalyserEl.value = this._enableAnalyser;
			enableAnalyserEl.addEventListener('value-changed', (e) => {
				this.enableAnalyser = e.detail.value;
			}); // value-changed
		} // if enableAnalyserEl

		// Show listener
		const showListenerEl = this.shadowRoot.querySelector('ui-boolean[label="showListener"]');
		if (showListenerEl) {
			showListenerEl.value = this._showListener;
			showListenerEl.addEventListener('value-changed', (e) => {
				this.showListener = e.detail.value;
			}); // value-changed
		} // if showListenerEl

		// Record mode
		const recordModeEl = this.shadowRoot.querySelector('ui-boolean[label="enable record mode"]');
		if (recordModeEl) {
			recordModeEl.value = this._recordMode;
			recordModeEl.addEventListener('value-changed', (e) => {
				this.recordMode = e.detail.value;
			}); // value-changed
		} // if recordModeEl

		// Listener position controls
		this._setupListenerControls();
	} // _setupEventListeners

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
					}); // value-changed
				} // if el
			}); // forEach ctrl
		} // if listenerFieldset
	} // _setupListenerControls

	_setupHelpDialog() {
		const helpDialog = this.shadowRoot.querySelector('#helpDialog');
		const closeBtn = this.shadowRoot.querySelector('#helpDialog .close-btn');
		const componentShortcutsBody = this.shadowRoot.querySelector('#componentShortcuts');

		if (not(helpDialog)) return;

		const updateComponentShortcuts = () => {
			if (not(componentShortcutsBody)) return;
			const shortcuts = getRegisteredShortcuts();
			componentShortcutsBody.innerHTML = shortcuts.map(({ shortcut, label }) => {
				const formattedShortcut = formatShortcutForDisplay(shortcut)
					.split(' + ')
					.map(key => `<kbd>${key}</kbd>`)
					.join(' + ');
				return `<tr><th>Focus ${label}</th><td>${formattedShortcut}</td></tr>`;
			}).join(''); // map
		}; // updateComponentShortcuts

		const showHelp = () => {
			updateComponentShortcuts();
			helpDialog.showModal();
			closeBtn.focus();
		}; // showHelp

		const hideHelp = () => {
			helpDialog.close();
		}; // hideHelp

		// F1 key to toggle help
		document.addEventListener('keydown', (e) => {
			if (e.key === 'F1') {
				e.preventDefault();
				if (helpDialog.open) {
					hideHelp();
				} else {
					showHelp();
				} // if open
			} // if F1
			// Native dialog handles Escape key automatically
		}); // keydown

		// Close button
		closeBtn.addEventListener('click', hideHelp);

		// Click backdrop to close (native dialog fires click on dialog element when clicking backdrop)
		helpDialog.addEventListener('click', (e) => {
			if (e.target === helpDialog) {
				hideHelp();
			} // if backdrop click
		}); // click
	} // _setupHelpDialog

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
			} // if enabled
		} // if ready
	} // set enableAutomation

	// Automation interval property
	get automationInterval() { return this._automationInterval; }
	set automationInterval(value) {
		this._automationInterval = Number(value);
		setAutomationInterval(this._automationInterval);
	} // set automationInterval

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
			} // if enabled
		} // if ready
	} // set enableAnalyser

	// Show listener property
	get showListener() { return this._showListener; }
	set showListener(value) {
		this._showListener = Boolean(value);
		const listenerEl = this.shadowRoot?.querySelector("#listener");
		if (listenerEl) {
			listenerEl.hidden = not(this._showListener);
		} // if listenerEl
	} // set showListener

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
				} // if src
			} else {
				recorder.setAttribute("hidden", "");
			} // if recordMode
		} // if recorder
	} // set recordMode

	// Listener position properties
	get listenerX() { return this._listenerX; }
	set listenerX(value) {
		this._listenerX = Number(value);
		if (this._ready) this._updateListenerPosition();
	} // set listenerX

	get listenerY() { return this._listenerY; }
	set listenerY(value) {
		this._listenerY = Number(value);
		if (this._ready) this._updateListenerPosition();
	} // set listenerY

	get listenerZ() { return this._listenerZ; }
	set listenerZ(value) {
		this._listenerZ = Number(value);
		if (this._ready) this._updateListenerPosition();
	} // set listenerZ

	_updateListenerPosition() {
		this.audio.listener.setPosition(this._listenerX, this._listenerY, this._listenerZ);
	} // _updateListenerPosition

	// Listener orientation properties
	get forwardX() { return this._forwardX; }
	set forwardX(value) {
		this._forwardX = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set forwardX

	get forwardY() { return this._forwardY; }
	set forwardY(value) {
		this._forwardY = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set forwardY

	get forwardZ() { return this._forwardZ; }
	set forwardZ(value) {
		this._forwardZ = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set forwardZ

	get upX() { return this._upX; }
	set upX(value) {
		this._upX = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set upX

	get upY() { return this._upY; }
	set upY(value) {
		this._upY = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set upY

	get upZ() { return this._upZ; }
	set upZ(value) {
		this._upZ = Number(value);
		if (this._ready) this._updateListenerOrientation();
	} // set upZ

	_updateListenerOrientation() {
		this.audio.listener.setOrientation(
			this._forwardX, this._forwardY, this._forwardZ,
			this._upX, this._upY, this._upZ
		);
	} // _updateListenerOrientation

	// Shortcuts property
	get shortcuts() { return this._shortcuts; }
	set shortcuts(value) {
		this._shortcuts = value || '';
		if (this._ready && value) {
			this._parseAndApplyShortcuts(value);
		} // if ready
	} // set shortcuts

	_parseAndApplyShortcuts(value) {
		const parameters = Array.from(this.shadowRoot.querySelectorAll("ui-number, ui-boolean, ui-text, ui-list"));
		const shortcuts = this._parseShortcuts(value);

		parameters.forEach(p => {
			const name = p.name || p.label;
			if (name) {
				const shortcut = shortcuts.find(x => x.parameter.toLowerCase() === name.toLowerCase());
				if (shortcut) {
					p.shortcut = shortcut.shortcut;
				} // if shortcut
			} // if name
		}); // forEach p
	} // _parseAndApplyShortcuts

	_parseShortcuts(text) {
		return text.split(",").map(definition => {
			const tokens = definition.match(/\w+/g);
			if (tokens.length < 3) {
				throw new Error(`${definition}: invalid shortcut definition`);
			} // if invalid
			return { parameter: tokens[0], shortcut: tokens.slice(1).join(" ") };
		}); // map
	} // _parseShortcuts

	// Audio loading for recording
	loadAudio(url) {
		statusMessage("Loading...");
		fetch(url)
			.then(response => {
				if (response.ok) return response.arrayBuffer();
				else throw new Error(response.statusText);
			}) // then response
			.then(data => {
				const audioContext = new window.AudioContext();
				return audioContext.decodeAudioData(data);
			}) // then data
			.then(buffer => {
				this.render(buffer);
				statusMessage(`${Math.round(buffer.duration / 60 * 10) / 10} minutes of audio loaded.`);
			}) // then buffer
			.catch(error => statusMessage(error.toString()));
	} // loadAudio

	// Enumerate all non-UI elements
	_enumerateAll(root) {
		return [
			root,
			Array.from(root.children).map(x => this._enumerateAll(x)),
			root.shadowRoot ? this._enumerateAll(root.shadowRoot) : []
		].flat(Infinity);
	} // _enumerateAll

	_enumerateNonUi() {
		return this._enumerateAll(this)
			.filter(x => x instanceof AudioComponentBase);
	} // _enumerateNonUi
} // class AudioContext

customElements.define('audio-context', AudioContext);

export { AudioContext };
export { AudioComponentBase } from "./audio-component-base.js";
