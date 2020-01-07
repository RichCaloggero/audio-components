import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {XTC} from "./xtc.tapped.js";



let instanceCount = 0;

class AudioXtc extends _AudioContext_{
static get template () {
return html`
<fieldset class="audio-xtc">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>
<ui-number label="delay" type="number" value="{{delay}}" min="0.0" max="0.5" step="0.00001"></ui-number>
<ui-number label="gain" value="{{gain}}" min="0.0" max="0.99" step="0.02"></ui-number>

<fieldset>
<legend><h3>PreProcessing</h3></legend>
<ui-boolean "enable preprocessing" value="{{enablePreprocessing}}"></ui-boolean>
<ui-number label="frequency" type="number" value="{{frequency}}" min="20" max="20000" step="10"></ui-number>
<ui-number label="q" type="number" value="{{q}}" min="0.01" max="5" step="0.01"></ui-number>
</fieldset>

<fieldset>
<legend><h3>Postprocessing</h3></legend>
<ui-number label="boost" value="{{bass}}" min="0.0" max="4.0" step="1"></ui-number>
<ui-number label="makeup" value="{{makeup}}" min="0.0" max="4.0" step="0.1"></ui-number>
</fieldset>

</fieldset>
`; // html
} // get template
static get is () {return "audio-xtc";}

static get properties () {
return {
label: String,
bandCount: Number,

delay: {type: Number, value: 0.00001, notify: true, observer: "delayChanged"},
gain: {type: Number, value: 0.98, notify: true, observer: "gainChanged"},

frequency: {type: Number, value: 1200, notify: true, observer: "frequencyChanged"},
q: {type: Number, value: 0.3, notify: true, observer: "qChanged"},
enablePreprocessing: {type: Boolean, value: false, notify: true, observer: "enablePreprocessingChanged"},

bass: {type: Number, value: 2, notify: true, observer: "bassChanged"},
makeup: {type: Number, value: 2, notify: true, observer: "makeupChanged"},
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = "audio-xtc" + instanceCount;
this.component = new XTC(this.audio, this.bandCount);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.mix = 0.6;
signalReady(this);
} // connectedCallback

delayChanged (value) {this.component.delay = value;}
gainChanged (value) {this.component.gain = value;}
frequencyChanged (value) {this.component.frequency = value;}
qChanged (value) {this.component.q = value;}
enablePreprocessingChanged (value) {this.component.enablePreprocessing = value;}
bassChanged (value) {this.component.bass = value;}
makeupChanged (value) {this.component.makeup = value;}


} // class AudioXtc

customElements.define(AudioXtc.is, AudioXtc);
