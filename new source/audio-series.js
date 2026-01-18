// audio-series.js
// Native Web Component for series audio connection
// Replaces Polymer-based AudioSeries

import { AudioComponentBase, childrenReady, not } from "./audio-component-base.js";
import { Series } from "./audio-component.js";

let instanceCount = 0;

class AudioSeries extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'feed-forward', 'feed-back', 'delay', 'gain'
		];
	} // get observedAttributes

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-series-${instanceCount}`;

		// Mark as container element
		this.container = true;

		// Series-specific properties
		this._feedForward = false;
		this._feedBack = false;
		this._delay = 0;
		this._gain = 0.5;
	} // constructor

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
				.feedback-controls[hidden] { display: none; }
			</style>
			<fieldset class="audio-series">
				<legend><h2>${this._label}</h2></legend>
				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="-1.0" max="1.0" step="0.1"></ui-number>

				<fieldset class="feedback-controls panel" hidden>
					<legend><h3>Feedback Controls</h3></legend>
					<ui-number label="delay" type="number" min="0" step="0.00001"></ui-number>
					<ui-number label="gain" min="-0.99" max="0.99" step="0.01"></ui-number>
				</fieldset>
			</fieldset>
			<slot></slot>
		`;
	} // get template

	connectedCallback() {
		super.connectedCallback();

		// Wait for all child audio components to be ready before building our component
		// This is critical - we can't connect children in series until they exist
		childrenReady(this, children => {
			console.log(`${this.id}: all ${children.length} children ready, building series component`);

			// Build the series component with child components
			this.component = new Series(
				this.audio,
				this.components(children),
				this._feedForward,
				this._feedBack,
				this
			);

			// Show/hide feedback controls based on feedBack setting
			this._updateFeedbackUI();

			// Note: isReady will be set to true by childrenReady after this callback returns
		}); // childrenReady
	} // connectedCallback

	_setupEventListeners() {
		// Bypass control
		const bypassEl = this.shadowRoot.querySelector('ui-boolean[label="bypass"]');
		if (bypassEl) {
			bypassEl.value = this._bypass;
			bypassEl.addEventListener('value-changed', (e) => {
				this.bypass = e.detail.value;
			}); // value-changed
		} // if bypassEl

		// Mix control
		const mixEl = this.shadowRoot.querySelector('ui-number[label="mix"]');
		if (mixEl) {
			mixEl.value = this._mix;
			mixEl.addEventListener('value-changed', (e) => {
				this.mix = e.detail.value;
			}); // value-changed
		} // if mixEl

		// Delay control (for feedback)
		const delayEl = this.shadowRoot.querySelector('ui-number[label="delay"]');
		if (delayEl) {
			delayEl.value = this._delay;
			delayEl.addEventListener('value-changed', (e) => {
				this.delay = e.detail.value;
			}); // value-changed
		} // if delayEl

		// Gain control (for feedback)
		const gainEl = this.shadowRoot.querySelector('.feedback-controls ui-number[label="gain"]');
		if (gainEl) {
			gainEl.value = this._gain;
			gainEl.addEventListener('value-changed', (e) => {
				this.gain = e.detail.value;
			}); // value-changed
		} // if gainEl
	} // _setupEventListeners

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'feed-forward':
				this._feedForward = newValue !== null;
				break; // case feed-forward
			case 'feed-back':
				this.feedBack = newValue !== null;
				break; // case feed-back
			case 'delay':
				this.delay = Number(newValue) || 0;
				break; // case delay
			case 'gain':
				this.gain = Number(newValue) || 0.5;
				break; // case gain
			default:
				super.attributeChangedCallback(name, oldValue, newValue);
		} // switch name
	} // attributeChangedCallback

	// Feed forward property
	get feedForward() { return this._feedForward; }
	set feedForward(value) {
		this._feedForward = Boolean(value);
	} // set feedForward

	// Feed back property
	get feedBack() { return this._feedBack; }
	set feedBack(value) {
		this._feedBack = Boolean(value);
		if (this._ready) {
			this._updateFeedbackUI();
			if (this._feedBack && this.component) {
				this.component.gain = this._gain;
				this.component.delay = this._delay;
			} // if feedBack
		} // if ready
	} // set feedBack

	// Delay property (for feedback loop)
	get delay() { return this._delay; }
	set delay(value) {
		this._delay = Number(value);
		if (this._ready && this._feedBack && this.component) {
			this.component.delay = this._delay;
		} // if ready
	} // set delay

	// Gain property (for feedback loop)
	get gain() { return this._gain; }
	set gain(value) {
		this._gain = Number(value);
		if (this._ready && this._feedBack && this.component) {
			this.component.gain = this._gain;
		} // if ready
	} // set gain

	_updateFeedbackUI() {
		const feedbackControls = this.shadowRoot?.querySelector('.feedback-controls');
		if (feedbackControls) {
			feedbackControls.hidden = not(this._feedBack);
		} // if feedbackControls
	} // _updateFeedbackUI
} // class AudioSeries

customElements.define('audio-series', AudioSeries);

export { AudioSeries };
