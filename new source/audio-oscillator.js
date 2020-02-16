import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, statusMessage} from "./audio-context.js";
import {Oscillator} from "./audio-component.js";

let instanceCount = 0;

const module = class AudioOscillator extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-oscillator">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>

<ui-list label="type" value="{{type}}" values='["sine", "square", "sawtooth", "triangle"]'></ui-list>
<ui-number label="frequency" value="{{frequency}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
<ui-number label="detune" value="{{detune}}" min="0.0" max="100.0" step="1.0"></ui-number>
<ui-boolean label="play" value="{{play}}" key="p"></ui-boolean>
</fieldset>
`; // html
} // get template
static get is() { return "audio-oscillator"; }

static get properties() {
return {
min: {type: Number, value: 0},
max: {type: Number, value: 20000},
step: {type: Number, value: 10},

type: String,
frequency: Number,
detune: Number,
//type: {type: String, notify: true, observer: "typeChanged"},
//frequency: {type: Number, notify: true, observer: "frequencyChanged"},
//detune: {type: Number, notify: true, observer: "detuneChanged"},
play: {type: Boolean, notify: true, observer: "playChanged"},
}; // return
} // get properties

static get observers () {
return [
"_update(type, frequency, detune)"
];
} // get observers

constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.options = {type: "", frequency: 0, detune: 0};
this.component = new Oscillator(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
this.isReady = true;
	} // connectedCallback

_update (type, frequency, detune) {
if (!this.isReady) return;
	this.options = {type, frequency, detune};
this.component.set(this.options);
} // _update

playChanged (value) {
if (this.isReady && value) {
this.component.set(this.options);
this.component.start();
} else {
this.component.stop();
} // if
} // playChanged
} // class AudioOscillator

customElements.define(module.is, module);
