// audio-player.js
// Native Web Component for audio file player
// Replaces Polymer-based AudioPlayer

import { AudioComponentBase, statusMessage, not } from "./audio-component-base.js";
import { AudioComponent } from "./audio-component.js";
import { handleUserKey } from "./ui.js";
import { registerAudioPlayer } from "./audio-context.js";

let instanceCount = 0;

class AudioPlayer extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'src'];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-player-${instanceCount}`;

		this._src = '';
		this.audioElement = null;
		this.audioSource = null;
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
				button { margin: 0.25em; padding: 0.5em 1em; }
			</style>
			<fieldset class="audio-player">
				<legend><h2>${this._label}</h2></legend>
				<ui-text label="Media URL" shortcut="alt shift u"></ui-text>
				<button class="play" aria-pressed="false">Play</button>
				<button class="back">back</button>
				<button class="forward">forward</button>
			</fieldset>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();

		// Create the audio component
		this.component = new AudioComponent(this.audio, "player");

		// Create HTML audio element and media source
		if (this.audio && this.audio instanceof window.AudioContext && this.audio.createMediaElementSource) {
			this.audioElement = document.createElement("audio");
			this.audioElement.setAttribute("crossorigin", "anonymous");
			this.audioElement.addEventListener("error", e => {
				statusMessage(`${this.id}: ${e.target.error?.message || 'Audio error'}`);
			}); // error

			this.audioSource = this.audio.createMediaElementSource(this.audioElement);

			this.component.input = null;
			this.audioSource.connect(this.component.output);
			this.component.audioSource = this.audioSource;
			this.component.src = "";
		} else {
			this.audioSource = this.component.audioSource = null;
		} // if audio context

		// Register this player globally
		registerAudioPlayer(this.component);

		this.isReady = true;
	} // connectedCallback

	_setupEventListeners() {
		// Media URL input
		const srcEl = this.shadowRoot.querySelector('ui-text[label="Media URL"]');
		if (srcEl) {
			srcEl.value = this._src;
			srcEl.addEventListener('value-changed', (e) => {
				this.src = e.detail.value;
			}); // value-changed
		} // if srcEl

		// Play button
		const playBtn = this.shadowRoot.querySelector('.play');
		if (playBtn) {
			playBtn.addEventListener('click', (e) => this._play(e));
			playBtn.addEventListener('keydown', (e) => this._handleSpecialKeys(e));
		} // if playBtn

		// Back button
		const backBtn = this.shadowRoot.querySelector('.back');
		if (backBtn) {
			backBtn.addEventListener('click', (e) => this._back(e));
		} // if backBtn

		// Forward button
		const forwardBtn = this.shadowRoot.querySelector('.forward');
		if (forwardBtn) {
			forwardBtn.addEventListener('click', (e) => this._forward(e));
		} // if forwardBtn
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'src':
				this.src = newValue || '';
				break; // case src
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Source property
	get src() { return this._src; }
	set src(value) {
		this._src = value || '';
		if (this._ready && this._src && this.audioElement) {
			this.audioElement.src = this.component.src = this._src;
			console.debug(`${this.id}: src is ${this._src}`);
		} // if ready
	} // set src

	isPlaying() {
		if (not(this._ready)) return false;
		const playBtn = this.shadowRoot.querySelector(".play");
		return playBtn?.getAttribute("aria-pressed") === "true";
	} // isPlaying

	_play(e) {
		if (not(this._ready) || not(this.audioElement)) return;

		const player = this.audioElement;
		const button = e.target;

		if (player.paused) {
			player.play();
			button.setAttribute("aria-pressed", "true");
		} else {
			player.pause();
			button.setAttribute("aria-pressed", "false");
		} // if paused

		button.focus();
	} // _play

	_back(e) {
		if (not(this._ready) || not(this.audioElement)) return;

		const player = this.audioElement;
		if (player.currentTime < 5) {
			player.currentTime = 0;
		} else {
			player.currentTime = player.currentTime - 5.0;
		} // if near start
	} // _back

	_forward(e) {
		if (not(this._ready) || not(this.audioElement)) return;

		const player = this.audioElement;
		if (player.currentTime < player.duration) {
			player.currentTime = player.currentTime + 5.0;
		} else {
			player.currentTime = player.duration;
		} // if not at end
	} // _forward

	_handleSpecialKeys(e) {
		if (handleUserKey(e)) {
			e.preventDefault();
		} // if handled
	} // _handleSpecialKeys
} // class AudioPlayer

customElements.define('audio-player', AudioPlayer);

export { AudioPlayer };
