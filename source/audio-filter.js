import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount = 0;


class AudioFilter extends _AudioContext_ {
static get template () {
return html`

<div class="audio-filter" role="region" aria-label$="{{label}}">
<div class="row">
<span class="label">[[label]]</span>

<ui-boolean name="bypass" value="{{bypass}}"></ui-boolean>

</div><div class="row">

<ui-list name="type" value="{{type}}" values='[
["allpass","all pass"],
["lowpass","low pass"],
["highpass","high pass"],
["bandpass","band pass"],
["lowshelf","low shelf"],
["highshelf","high shelf"],
["peaking","peaking"],
["notch","notch"]
]'></ui-list>

<ui-number name="frequency" value="{{frequency}}" min="20.0" max="20000.0" step="10.0"></ui-number>
<ui-number name="q" label="Q" value="{{q}}" min="0.01" max="20.0" step="0.01"></ui-number>

</div><div class="row">


<ui-number name="gain" value="{{gain}}" min="-30.0" max="30.0" step="1"></ui-number>
<ui-number name="detune" value="{{detune}}" min="0.0" max="100.0"></ui-number>

</div><!-- .row -->

</div>
`; // html
} // get template

static get is() { return "audio-filter"; }

static get properties () {
return {
bypass: {
type: Boolean,
value: false,
notify: true,
observer: "_bypass"
}, // bypass
label: {
type: String,
value: ""
}, // label

type: {
type: String,
value: "allpass",
notify: true,
observer: "typeChanged"
}, //type

frequency: {
type: Number,
value: 400.0,
notify: true,
observer: "frequencyChanged"
}, // frequency

q: {
type: Number,
value: 0.76,
notify: true,
observer: "qChanged"
}, // q

detune: {
type: Number,
value: 0.0,
notify: true,
observer: "detuneChanged"
}, // detune

gain: {
type: Number,
value: 1.0,
notify: true,
observer: "gainChanged"
} // gain

}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioFilter.is + instanceCount;

this._init (audio.createBiquadFilter ());
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck(AudioFilter.is)) {
this.addFieldLabels ();
} // if
} // connectedCallback


typeChanged (value) {
this._audioNode.type = value;
} // typeChanged

gainChanged (value) {
this._setParameterValue (this._audioNode.gain, value);
} // gainChanged

qChanged (value) {
this._setParameterValue (this._audioNode.Q, value);
} // qChanged

frequencyChanged (value) {
this._setParameterValue (this._audioNode.frequency, value);
} // frequencyChanged

detuneChanged (value) {
this._setParameterValue (this._audioNode.detune, value);
} // detuneChanged


} // class AudioFilter

window.customElements.define(AudioFilter.is, AudioFilter);
