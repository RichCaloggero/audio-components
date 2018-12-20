import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount  = 0;

class AudioFilter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-filter">
<legend><h2>{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>

<ui-list label="type" value="{{type}}" values='[
["allpass","all pass"],
["lowpass","low pass"],
["highpass","high pass"],
["bandpass","band pass"],
["lowshelf","low shelf"],
["highshelf","high shelf"],
["peaking","peaking"],
["notch","notch"]
]'></ui-list>

<ui-number label="frequency" value="{{frequency}}" min="20.0" max="20000.0" step="10.0"></ui-number>
<ui-number label="Q" value="{{q}}" min="0.01" max="20.0" step="0.01"></ui-number>

<br><ui-number label="gain" value="{{gain}}" min="-30.0" max="30.0" step="1"></ui-number>
<ui-number label="detune" value="{{detune}}" min="0.0" max="100.0"></ui-number>

</fieldset>
`; // html
} // get template

static get is() { return "audio-filter"; }

static get properties () {
return {
label: String,
type: {type: String, value: "lowpass", notify: true, observer: "typeChanged"},

bypass: {type: Boolean, value: false, notify: true, observer: "bypassChanged"},
mix: {type: Boolean, value: false, notify: true, observer: "mixChanged"},
frequency: {type: Number, value: 300.0, notify: true, observer: "frequencyChanged"},
q: {type: Number, value: 1.0, notify: true, observer: "qChanged"},
gain: {type: Number, value: 1.0, notify: true, observer: "gainChanged"},
detune: {type: Number, value: 0.0, notify: true, observer: "detuneChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioFilter.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio, "filter");
this.filter = audio.createBiquadFilter();
this.component.input.connect(this.filter);
this.filter.connect(this.component.wet);
} // constructor


bypassChanged (value) {
if (this.component) this.component.bypass(value);
} // bypassChanged

mixChanged (value) {
if (this.component) this.component.mix(value);
} // mixChanged
frequencyChanged (value) {
console.log(`audio-filter: frequency ${value}`);
this.filter.frequency.value = value;
}
qChanged (value) {this.filter.Q.value = value;}
typeChanged (value) {this.filter.type = value;}
detuneChanged (value) {this.filter.detune.value = value;}
gainChanged (value) {this.filter.gain.value = value;}

} // class AudioGain

window.customElements.define(AudioFilter.is, AudioFilter);
