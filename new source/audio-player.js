// audio-player.js
// Native Web Component for audio file player
// Replaces Polymer-based AudioPlayer

import { AudioComponentBase, statusMessage } from "./audio-component-base.js";
import { AudioComponent } from "./audio-component.js";
import { handleUserKey } from "./ui.js";
import { registerAudioPlayer } from "./audio-context.js";

let instanceCount = 0;

class AudioPlayer extends AudioComponentBase {
	static get observedAttributes() {
		return ['label', 'hide', 'src'];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-player-${instanceCount}`;

		this._src = '';
		this.audioElement = null;
		this.audioSource = null;
	}

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
	}

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
			});

			this.audioSource = this.audio.createMediaElementSource(this.audioElement);

			this.component.input = null;
			this.audioSource.connect(this.component.output);
			this.component.audioSource = this.audioSource;
			this.component.src = "";
		} else {
			this.audioSource = this.component.audioSource = null;
		}

		// Register this player globally
		registerAudioPlayer(this.component);

		this.isReady = true;
	}

	_setupEventListeners() {
		// Media URL input
		const srcEl = this.shadowRoot.querySelector('ui-text[label="Media URL"]');
		if (srcEl) {
			srcEl.value = this._src;
			srcEl.addEventListener('value-changed', (e) => {
				this.src = e.detail.value;
			});
		}

		// Play button
		const playBtn = this.shadowRoot.querySelector('.play');
		if (playBtn) {
			playBtn.addEventListener('click', (e) => this._play(e));
			playBtn.addEventListener('keydown', (e) => this._handleSpecialKeys(e));
		}

		// Back button
		const backBtn = this.shadowRoot.querySelector('.back');
		if (backBtn) {
			backBtn.addEventListener('click', (e) => this._back(e));
		}

		// Forward button
		const forwardBtn = this.shadowRoot.querySelector('.forward');
		if (forwardBtn) {
			forwardBtn.addEventListener('click', (e) => this._forward(e));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'src':
				this.src = newValue || '';
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Source property
	get src() { return this._src; }
	set src(value) {
		this._src = value || '';
		if (this._ready && this._src && this.audioElement) {
			this.audioElement.src = this.component.src = this._src;
			console.debug(`${this.id}: src is ${this._src}`);
		}
	}

	isPlaying() {
		if (!this._ready) return false;
		const playBtn = this.shadowRoot.querySelector(".play");
		return playBtn?.getAttribute("aria-pressed") === "true";
	}

	_play(e) {
		if (!this._ready || !this.audioElement) return;

		const player = this.audioElement;
		const button = e.target;

		if (player.paused) {
			player.play();
			button.textContent = "pause";
			button.setAttribute("aria-pressed", "true");
		} else {
			player.pause();
			button.textContent = "play";
			button.setAttribute("aria-pressed", "false");
		}

		button.focus();
	}

	_back(e) {
		if (!this._ready || !this.audioElement) return;

		const player = this.audioElement;
		if (player.currentTime < 5) {
			player.currentTime = 0;
		} else {
			player.currentTime = player.currentTime - 5.0;
		}
	}

	_forward(e) {
		if (!this._ready || !this.audioElement) return;

		const player = this.audioElement;
		if (player.currentTime < player.duration) {
			player.currentTime = player.currentTime + 5.0;
		} else {
			player.currentTime = player.duration;
		}
	}

	_handleSpecialKeys(e) {
		if (handleUserKey(e)) {
			e.preventDefault();
		}
	}
}

customElements.define('audio-player', AudioPlayer);

export { AudioPlayer };
