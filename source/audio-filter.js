import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {Filter} from "./audio-component.js";

let instanceCount  = 0;

class AudioFilter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-filter">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>

<ui-list label="type" initial-value="[[type]]" value="{{type}}" values='[
["peaking","peaking"],
["notch","notch"],
["bandpass","band pass"],
["lowpass","low pass"],
["highpass","high pass"],
["lowshelf","low shelf"],
["highshelf","high shelf"],
["allpass","all pass"]
]'></ui-list>

<ui-number label="frequency" type="number" value="{{frequency}}" min="20" max="20000" step="10.0"></ui-number>
<ui-number label="Q" type="number" value="{{q}}" min="-100.0" max="100.0" step="0.01"></ui-number>

<br><ui-number label="gain" value="{{gain}}" min="-30.0" max="30.0" step="1"></ui-number>
<ui-number label="detune" value="{{detune}}" min="0.0" max="100.0"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-filter"; }

static get properties () {
return {
type: {type: String, value: "lowpass", notify: true, observer: "typeChanged"},
frequency: {type: Number, notify: true, value: 350, observer: "frequencyChanged"},
q: {type: Number, notify: true, value: 1, observer: "qChanged"},
gain: {type: Number, notify: true, value: 1, observer: "gainChanged"},
detune: {type: Number, value: 0, notify: true, observer: "detuneChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioFilter.is}-${instanceCount}`;

this.component = new Filter(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

typeChanged (value) {if(this._ready && value) this.component.type = value;}
frequencyChanged (value) {if (this._ready && Number(value)) this.component.frequency = value;}
qChanged (value) {if (this._ready && Number(value)) this.component.q = value;}
gainChanged (value) {if (this._ready && Number(value)) this.component.gain = value;}
detuneChanged (value) {if (this._ready && Number(value)) this.component.detune = value;}
} // class AudioFilter

customElements.define(AudioFilter.is, AudioFilter);
