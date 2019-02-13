import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";


let instanceCount  = 0;

class AudioEqualizer extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-equalizer">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="q" label="Q" value="{{q}}" min="0.1" max="10.0" step="0.1"></ui-number>
<button class="reset" accesskey="r" on-click="resetAll">reset all bands</button>
</fieldset>
`; // html
} // get template

static get is() { return "audio-equalizer"; }

static get properties () {
return {
q: {type: Number, value: 1.414, notify: true,//observer: "qChanged"
}
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioEqualizer.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio, "equalizer");
attachDom(this);
} // constructor

connectedCallback () {
super.connectedCallback ();
childrenReady(this)
.then(children => {
const processor = this.components(children)[0];
console.debug(`processor: ${processor}`);
this.component.input.connect(processor.input);
processor.output.connect(this.component.wet);
signalReady(this);
}); // childrenReady
} // connectedCallback

resetAll () {
let processor = this.shadowRoot.querySelector("#processor");
Array.from(processor.querySelectorAll("audio-filter"))
.forEach ((filter) => {
filter.setAttribute ("gain", "0.0");
}); // forEach filter
} // resetAll
} // class AudioEqualizer

customElements.define(AudioEqualizer.is, AudioEqualizer);

function attachDom(element) {
element.innerHTML = `
<audio-parallel id="processor">
<audio-filter label="32" frequency="32" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="64" frequency="64" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="128" frequency="128" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="256" frequency="256" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="512" frequency="512" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>

<audio-filter label="1024" frequency="1024" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="2048" frequency="2048" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="4096" frequency="4096" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="8192" frequency="8192" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
<audio-filter label="16384" frequency="16384" q="{{q}}" type="peaking" gain="0" hide="bypass, q, type, frequency, detune"></audio-filter>
</audio-parallel>
`; // html
} // attachDom
