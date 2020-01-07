import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, audio, signalReady, statusMessage} from "./audio-context.js";
import {Compressor} from "./audio-component.js";


let instanceCount = 0;


class AudioCompressor extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-compressor">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>

<ui-number label="ratio" value="{{ratio}}" min="0.0" max="100.0"></ui-number>
<ui-number label="threshold" value="{{threshold}}" min="-150.0" max="20.0"></ui-number>
<ui-number label="knee" value="{{knee}}" min="0.0" max="50.0"></ui-number>

<ui-number label="attack" value="{{attack}}" min="0.0" max="10.0" step="0.1"></ui-number>
<ui-number label="release" value="{{release}}" min="0.0" max="10.0" step="0.1"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-compressor"; }

static get properties () {
return {
ratio: {type: Number, value: 10.0, notify: true, observer: "ratioChanged"}, //ratio
threshold: {type: Number, value: -40.0, notify: true, observer: "thresholdChanged"}, // threshold
knee: {type: Number, value: 20.0, notify: true, observer: "kneeChanged"}, // knee
reduction: {type: Number, notify: true,}, // reduction
attack: {type: Number, value: 0.1, notify: true, observer: "attackChanged"}, // attack
release: {type: Number, value: 0.75, notify: true, observer: "releaseChanged"} // release
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioCompressor.is}-${instanceCount}`;
this.component = new Compressor(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback


ratioChanged (value) {
this.component.compressor.ratio.value = value;
this.reduction = this.component.compressor.reduction;
} // ratioChanged

thresholdChanged (value) {
this.component.compressor.threshold.value = value;
this.reduction = this.component.compressor.reduction;
} // thresholdChanged

kneeChanged (value) {
this.component.compressor.knee.value = value;
this.reduction = this.component.compressor.reduction;
} // kneeChanged

attackChanged (value) {
this.component.compressor.attack.value = value;
this.reduction = this.component.compressor.reduction;
} // attackChanged

releaseChanged (value) {
this.component.compressor.release.value = value;
this.reduction = this.component.compressor.reduction;
} // releaseChanged
} // class AudioCompressor

customElements.define(AudioCompressor.is, AudioCompressor);
