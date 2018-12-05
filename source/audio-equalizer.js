import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class AudioEqualizer extends _AudioContext_ {
static get template () {
return html`

<div class="audio-equalizer" role="region" aria-label$="[[label]]">
<span class="label">[[label]]</span>

<ui-boolean name="bypass" value="{{bypass}}"></ui-boolean>
<ui-number name="q" label="Q" value="{{q}}" min="0.1" max="5.0" step="0.1"></ui-number>
<button class="reset" accesskey="r" on-click="resetAll">reset all bands</button>

<audio-parallel class="bands">
<template is="dom-repeat" items="{{frequencies}}">
<audio-filter label="{{item.frequency}}" frequency="{{item.frequency}}" q="{{q}}" type="peaking" gain="0.0" hide-controls="bypass q type frequency detune"></audio-filter>
</template>
</audio-parallel>

</div>
`; // html
} // get template
static get is() { return "audio-equalizer"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

bypass: {
type: Boolean,
value: false,
notify: true,
observer: "_bypass"
}, // bypass

q: {
type: Number,
value: 1.414,
notify: true,
observer: "qChanged"
}, // q

frequencies: {
type: Array,
value() {
return [
{frequency: 32},
{frequency: 64},
{frequency: 128},
{frequency: 256},
{frequency: 512},
{frequency: 1024},
{frequency: 2048},
{frequency: 4096},
{frequency: 8192},
{frequency: 16384}
]; // return array contents
} // value
} // frequencies
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioEqualizer.is + instanceCount;
this._init ();
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
this.connectAll ();
} // connectedCallback

connectAll () {
var processor = this.shadowRoot.querySelector("audio-parallel");
this._audioIn.connect (processor._in);
processor._out.connect (this._audioOut);
} // connectAll

resetAll () {
let processor = this.shadowRoot.querySelector("audio-parallel");
Array.from(processor.querySelectorAll("audio-filter"))
.forEach ((filter) => {
filter.gain = 0.0;
}); // forEach filter
} // resetAll


} // class AudioEqualizer


window.customElements.define(AudioEqualizer.is, AudioEqualizer);