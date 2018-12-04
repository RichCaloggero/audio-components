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

<audio-parallel>
<audio-filter label="32" frequency="32" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="64" frequency="64" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="128" frequency="128" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="256" frequency="256" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="512" frequency="512" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>

<audio-filter label="1024" frequency="1024" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="2048" frequency="2048" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="4096" frequency="4096" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="8192" frequency="8192" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
<audio-filter label="16384" frequency="16384" q="{{q}}" type="peaking" gain="0" hide-controls="bypass q type frequency detune"></audio-filter>
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
//observer: "qChanged"
} // q

}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioEqualizer.is + instanceCount;
this._init ();
console.log (`constructor: ${this.id} created`);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
this.connectAll ();
} // connectedCallback

connectAll () {
let processor = this.shadowRoot.querySelector("audio-parallel");
this._audioIn.connect (processor._in);
processor._out.connect (this._audioOut);
} // connectAll

resetAll () {
let processor = this.shadowRoot.querySelector("audio-parallel");
Array.from(processor.querySelectorAll("audio-filter"))
.forEach ((filter) => {
filter.setAttribute ("gain", "0.0");
}); // forEach filter
} // resetAll

} // class AudioEqualizer


window.customElements.define(AudioEqualizer.is, AudioEqualizer);
