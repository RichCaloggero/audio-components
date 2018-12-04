import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount = 0;


class AudioCompressor extends _AudioContext_ {
static get template () {
return html`

<div class="audio-compressor" role="region" aria-label$="{{label}}">
<span class="label">[[label]] (reduction: {{reduction}})</span>
<ui-boolean name="bypass" value="{{bypass}}"></ui-boolean>

<div class="row">
<ui-number name="ratio" value="{{ratio}}" min="0.0" max="100.0"></ui-number>
<ui-number name="threshold" value="{{threshold}}" min="-150.0" max="20.0"></ui-number>
<ui-number name="knee" value="{{knee}}" min="0.0" max="50.0"></ui-number>

</div><div class="row">
<ui-number name="attack" value="{{attack}}" min="0.0" max="10.0" step="0.1"></ui-number>
<ui-number name="release" value="{{release}}" min="0.0" max="10.0" step="0.1"></ui-number>

</div><!-- .row -->

</div>
`; // html
} // get template

static get is() { return "audio-compressor"; }

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

ratio: {
type: Number,
value: 10.0,
notify: true,
observer: "ratioChanged"
}, //ratio

threshold: {
type: Number,
value: -40.0,
notify: true,
observer: "thresholdChanged"
}, // threshold

knee: {
type: Number,
value: 20.0,
notify: true,
observer: "kneeChanged"
}, // knee

reduction: {
type: Number,
notify: true,
}, // reduction

attack: {
type: Number,
value: 0.1,
notify: true,
observer: "attackChanged"
}, // attack

release: {
type: Number,
value: 0.75,
notify: true,
observer: "releaseChanged"
} // release
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioCompressor.is + instanceCount;

this._init (audio.createDynamicsCompressor());
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
} // connectedCallback


ratioChanged (value) {
this._setParameterValue (this._audioNode.ratio, value);
this.reduction = this._audioNode.reduction;
} // ratioChanged

thresholdChanged (value) {
this._setParameterValue (this._audioNode.threshold, value);
this.reduction = this._audioNode.reduction;
} // thresholdChanged

kneeChanged (value) {
this._setParameterValue (this._audioNode.knee, value);
this.reduction = this._audioNode.reduction;
} // kneeChanged

attackChanged (value) {
this._setParameterValue (this._audioNode.attack, value);
this.reduction = this._audioNode.reduction;
} // attackChanged

releaseChanged (value) {
this._setParameterValue (this._audioNode.release, value);
this.reduction = this._audioNode.reduction;
} // releaseChanged


} // class AudioCompressor

window.customElements.define(AudioCompressor.is, AudioCompressor);
