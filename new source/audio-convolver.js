// audio-convolver.js
// Native Web Component for convolver (reverb) node
// Replaces Polymer-based AudioConvolver

import { AudioComponentBase, statusMessage, getAudio, not } from "./audio-component-base.js";
import { Convolver } from "./audio-component.js";

let instanceCount = 0;

const DEFAULT_IMPULSES = [
	"Block Inside",
	"Bottle Hall",
	"Cement Blocks 2",
	"Cement Blocks 1",
	"Chateau de Logne, Outside",
	"Conic Long Echo Hall",
	"Deep Space",
	"Derlon Sanctuary",
	"Direct Cabinet N1",
	"Direct Cabinet N2",
	"Direct Cabinet N3",
	"Direct Cabinet N4",
	"French 18th Century Salon",
	"Five Columns Long",
	"Five Columns",
	"Going Home",
	"Greek 7 Echo Hall",
	"In The Silo",
	"In The Silo Revised",
	"Highly Damped Large Room",
	"Large Bottle Hall",
	"Large Long Echo Hall",
	"Large Wide Echo Hall",
	"Masonic Lodge",
	"Musikvereinsaal",
	"Narrow Bumpy Space",
	"Nice Drum Room",
	"On a Star",
	"Parking Garage",
	"Rays",
	"Right Glass Triangle",
	"Ruby Room",
	"Scala Milan Opera Hall",
	"Small Prehistoric Cave",
	"Small Drum Room",
	"St Nicolaes Church",
	"Grig Room",
	"Vocal Duo"
];

class AudioConvolver extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'impulse', 'impulses', 'path', 'extension'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-convolver-${instanceCount}`;

		// Convolver properties
		this._path = '.';
		this._extension = '.wav';
		this._impulse = '';
		this._impulses = DEFAULT_IMPULSES;

		this.component = new Convolver(this.audio);
	}

	get template() {
		const impulsesJson = JSON.stringify(this._impulses);
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-convolver">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1" max="1" step="0.05"></ui-number>
				<ui-list label="impulse" values='${impulsesJson}'></ui-list>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		// Set default impulse if not already set
		if (this._impulses.length > 0 && not(this._impulse)) {
			this._impulse = this._impulses[0];
		}

		this.isReady = true;
	}

	_setupEventListeners() {
		// Bypass
		const bypassEl = this.shadowRoot.querySelector('ui-boolean[label="bypass"]');
		if (bypassEl) {
			bypassEl.value = this._bypass;
			bypassEl.addEventListener('value-changed', (e) => this.bypass = e.detail.value);
		}

		// Mix
		const mixEl = this.shadowRoot.querySelector('ui-number[label="mix"]');
		if (mixEl) {
			mixEl.value = this._mix;
			mixEl.addEventListener('value-changed', (e) => this.mix = e.detail.value);
		}

		// Impulse selector
		const impulseEl = this.shadowRoot.querySelector('ui-list[label="impulse"]');
		if (impulseEl) {
			impulseEl.value = this._impulse;
			impulseEl.addEventListener('value-changed', (e) => this.impulse = e.detail.value);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'impulse':
				this.impulse = newValue || '';
				break;
			case 'impulses':
				try {
					this._impulses = JSON.parse(newValue);
				} catch (e) {
					this._impulses = DEFAULT_IMPULSES;
				}
				break;
			case 'path':
				this._path = newValue || '.';
				break;
			case 'extension':
				this._extension = newValue || '.wav';
				break;
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		}
	}

	// Path property
	get path() { return this._path; }
	set path(value) { this._path = value || '.'; }

	// Extension property
	get extension() { return this._extension; }
	set extension(value) { this._extension = value || '.wav'; }

	// Impulses list property
	get impulses() { return this._impulses; }
	set impulses(value) {
		if (typeof value === 'string') {
			try {
				this._impulses = JSON.parse(value);
			} catch (e) {
				this._impulses = DEFAULT_IMPULSES;
			}
		} else if (Array.isArray(value)) {
			this._impulses = value;
		}
	}

	// Impulse property
	get impulse() { return this._impulse; }
	set impulse(value) {
		this._impulse = value;
		if (this._ready && value) {
			const url = `${this._path}/${value}${this._extension}`;
			console.debug(`${this.id}: loading impulse from ${url}`);
			this._loadImpulse(url, buffer => {
				this.component.setImpulse(buffer);
			});
		}
	}

	_loadImpulse(url, callback) {
		const audio = getAudio();

		fetch(url)
			.then(response => {
				if (response.ok) return response.arrayBuffer();
				else throw new Error(response.statusText);
			})
			.then(data => {
				return audio.decodeAudioData(data);
			})
			.then(buffer => {
				if (buffer) callback(buffer);
				else throw new Error("No buffer");
			})
			.catch(error => statusMessage(error.toString()));
	}
}

customElements.define('audio-convolver', AudioConvolver);

export { AudioConvolver };
