// audio-panner.js
// Native Web Component for 3D panner node
// Replaces Polymer-based AudioPanner

import { AudioComponentBase } from "./audio-component-base.js";
import { Panner } from "./audio-component.js";

let instanceCount = 0;

class AudioPanner extends AudioComponentBase {
	static get observedAttributes() {
		return [
			'label', 'hide', 'bypass', 'mix', 'silent-bypass', 'hide-on-bypass',
			'position', 'x', 'y', 'z',
			'orientation-x', 'orientation-y', 'orientation-z',
			'inner-angle', 'outer-angle', 'outer-gain',
			'distance-model', 'max-distance', 'ref-distance', 'rolloff-factor'
		];
	}

	constructor() {
		super();
		instanceCount++;
		this.id = `audio-panner-${instanceCount}`;

		// Position properties
		this._x = 0;
		this._y = 0;
		this._z = 0;

		// Orientation properties
		this._orientationX = 0;
		this._orientationY = 0;
		this._orientationZ = 0;

		// Cone properties
		this._innerAngle = 360;
		this._outerAngle = 360;
		this._outerGain = 0;

		// Distance properties
		this._distanceModel = 'inverse';
		this._refDistance = 1;
		this._maxDistance = 1000;
		this._rolloffFactor = 5;

		this.component = new Panner(this.audio);
	}

	get template() {
		return `
			<style>
				:host { display: block; }
				fieldset { border: 1px solid #ccc; padding: 1em; margin: 0.5em 0; }
				legend h2 { margin: 0; font-size: 1.1em; }
			</style>
			<fieldset class="audio-panner">
				<legend><h2>${this._label}</h2></legend>

				<ui-boolean label="bypass"></ui-boolean>
				<ui-number label="mix" min="0" max="1" step="0.1"></ui-number>

				<ui-number label="x" min="-1000" max="1000" step="0.1" shortcut="alt shift x"></ui-number>
				<ui-number label="y" min="-1000" max="1000" step="0.1" shortcut="alt shift y"></ui-number>
				<ui-number label="z" min="-1000" max="1000" step="0.1" shortcut="alt shift z"></ui-number>

				<ui-number label="orientationX" min="-1000" max="1000" step="0.1"></ui-number>
				<ui-number label="orientationY" min="-1000" max="1000" step="0.1"></ui-number>
				<ui-number label="orientationZ" min="-1000" max="1000" step="0.1"></ui-number>

				<ui-number label="innerAngle" min="0" max="360" step="1"></ui-number>
				<ui-number label="outerAngle" min="0" max="360" step="1"></ui-number>
				<ui-number label="outerGain" min="0" max="1" step="0.1"></ui-number>

				<ui-text label="distanceModel"></ui-text>
				<ui-number label="maxDistance" min="0" max="1000" step="1"></ui-number>
				<ui-number label="refDistance" min="0" max="1000" step="0.1"></ui-number>
				<ui-number label="rolloffFactor" min="0" max="100" step="0.1"></ui-number>
			</fieldset>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.isReady = true;
	}

	_setupEventListeners() {
		// Bypass
		this._bindControl('ui-boolean[label="bypass"]', '_bypass', 'bypass');

		// Mix
		this._bindControl('ui-number[label="mix"]', '_mix', 'mix');

		// Position
		this._bindControl('ui-number[label="x"]', '_x', 'x');
		this._bindControl('ui-number[label="y"]', '_y', 'y');
		this._bindControl('ui-number[label="z"]', '_z', 'z');

		// Orientation
		this._bindControl('ui-number[label="orientationX"]', '_orientationX', 'orientationX');
		this._bindControl('ui-number[label="orientationY"]', '_orientationY', 'orientationY');
		this._bindControl('ui-number[label="orientationZ"]', '_orientationZ', 'orientationZ');

		// Cone
		this._bindControl('ui-number[label="innerAngle"]', '_innerAngle', 'innerAngle');
		this._bindControl('ui-number[label="outerAngle"]', '_outerAngle', 'outerAngle');
		this._bindControl('ui-number[label="outerGain"]', '_outerGain', 'outerGain');

		// Distance
		this._bindControl('ui-text[label="distanceModel"]', '_distanceModel', 'distanceModel');
		this._bindControl('ui-number[label="maxDistance"]', '_maxDistance', 'maxDistance');
		this._bindControl('ui-number[label="refDistance"]', '_refDistance', 'refDistance');
		this._bindControl('ui-number[label="rolloffFactor"]', '_rolloffFactor', 'rolloffFactor');
	}

	_bindControl(selector, privateProp, publicProp) {
		const el = this.shadowRoot.querySelector(selector);
		if (el) {
			el.value = this[privateProp];
			el.addEventListener('value-changed', (e) => {
				this[publicProp] = e.detail.value;
			});
		}
	}

	// Position properties
	get x() { return this._x; }
	set x(value) {
		this._x = Number(value);
		if (this._ready) this.component.x = this._x;
	}

	get y() { return this._y; }
	set y(value) {
		this._y = Number(value);
		if (this._ready) this.component.y = this._y;
	}

	get z() { return this._z; }
	set z(value) {
		this._z = Number(value);
		if (this._ready) this.component.z = this._z;
	}

	// Orientation properties
	get orientationX() { return this._orientationX; }
	set orientationX(value) {
		this._orientationX = Number(value);
		if (this._ready) this.component.panner.orientationX.value = this._orientationX;
	}

	get orientationY() { return this._orientationY; }
	set orientationY(value) {
		this._orientationY = Number(value);
		if (this._ready) this.component.panner.orientationY.value = this._orientationY;
	}

	get orientationZ() { return this._orientationZ; }
	set orientationZ(value) {
		this._orientationZ = Number(value);
		if (this._ready) this.component.panner.orientationZ.value = this._orientationZ;
	}

	// Cone properties
	get innerAngle() { return this._innerAngle; }
	set innerAngle(value) {
		this._innerAngle = Number(value);
		if (this._ready) this.component.panner.coneInnerAngle = this._innerAngle;
	}

	get outerAngle() { return this._outerAngle; }
	set outerAngle(value) {
		this._outerAngle = Number(value);
		if (this._ready) this.component.panner.coneOuterAngle = this._outerAngle;
	}

	get outerGain() { return this._outerGain; }
	set outerGain(value) {
		this._outerGain = Number(value);
		if (this._ready) this.component.panner.coneOuterGain = this._outerGain;
	}

	// Distance properties
	get distanceModel() { return this._distanceModel; }
	set distanceModel(value) {
		this._distanceModel = value;
		if (this._ready) this.component.panner.distanceModel = this._distanceModel;
	}

	get maxDistance() { return this._maxDistance; }
	set maxDistance(value) {
		this._maxDistance = Number(value);
		if (this._ready) this.component.panner.maxDistance = this._maxDistance;
	}

	get refDistance() { return this._refDistance; }
	set refDistance(value) {
		this._refDistance = Number(value);
		if (this._ready) this.component.panner.refDistance = this._refDistance;
	}

	get rolloffFactor() { return this._rolloffFactor; }
	set rolloffFactor(value) {
		this._rolloffFactor = Number(value);
		if (this._ready) this.component.panner.rolloffFactor = this._rolloffFactor;
	}

	// Position string property (convenience)
	get position() {
		return `${this._x}, ${this._y}, ${this._z}`;
	}
	set position(value) {
		if (!this._ready) return;
		const coords = value.split(",").map(x => Number(x.trim()));
		this.x = coords[0] || 0;
		this.y = coords[1] || 0;
		this.z = coords[2] || 0;
	}
}

customElements.define('audio-panner', AudioPanner);

export { AudioPanner };
