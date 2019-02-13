import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";
import {Equalizer} from "./audio-component.js";

let instanceCount  = 0;

class AudioEqualizer extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-equalizer">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="q" value="{{q}}" min="0.1" max="10.0" step="0.1"></ui-number>
<button class="reset" accesskey="r" on-click="resetAll">reset all bands</button>

<ui-number label="32" value="{{gain32}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="64" value="{{gain64}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="128" value="{{gain128}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="256" value="{{gain256}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="512" value="{{gain512}}" min="-30" max="30" step="1"></ui-number>

<ui-number label="1024" value="{{gain1024}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="2048" value="{{gain2048}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="4096" value="{{gain4096}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="8192" value="{{gain8192}}" min="-30" max="30" step="1"></ui-number>
<ui-number label="16384" value="{{gain16384}}" min="-30" max="30" step="1"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-equalizer"; }

static get properties () {
return {
q: {type: Number, value: 1.414, notify: true, observer: "qChanged"},

gain32: {type: Number, value: 0, notify: true, observer: "gain32Changed"},
gain64: {type: Number, value: 0, notify: true, observer: "gain64Changed"},
gain128: {type: Number, value: 0, notify: true, observer: "gain128Changed"},
gain256: {type: Number, value: 0, notify: true, observer: "gain256Changed"},
gain512: {type: Number, value: 0, notify: true, observer: "gain512Changed"},

gain1024: {type: Number, value: 0, notify: true, observer: "gain1024Changed"},
gain2048: {type: Number, value: 0, notify: true, observer: "gain2048Changed"},
gain4096: {type: Number, value: 0, notify: true, observer: "gain4096Changed"},
gain8192: {type: Number, value: 0, notify: true, observer: "gain8192Changed"},
gain16384: {type: Number, value: 0, notify: true, observer: "gain16384Changed"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioEqualizer.is}-${instanceCount}`;

this.component = new Equalizer(this.audio, frequencies());
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback

reset () {
this.component.reset();
} // reset

qChanged (value) {this.component.q = value;}

gain32Changed (value) {this.component.filters[0].filter.gain.value = value;}
gain64Changed (value) {this.component.filters[1].filter.gain.value = value;}
gain128Changed (value) {this.component.filters[2].filter.gain.value = value;}
gain256Changed (value) {this.component.filters[3].filter.gain.value = value;}
gain512Changed (value) {this.component.filters[4].filter.gain.value = value;}

gain1024Changed (value) {this.component.filters[5].filter.gain.value = value;}
gain2048Changed (value) {this.component.filters[6].filter.gain.value = value;}
gain4096Changed (value) {this.component.filters[7].filter.gain.value = value;}
gain8192Changed (value) {this.component.filters[8].filter.gain.value = value;}
gain16384Changed (value) {this.component.filters[9].filter.gain.value = value;}
} // class AudioEqualizer

customElements.define(AudioEqualizer.is, AudioEqualizer);

function frequencies (count = 10, base = 32) {
const _frequencies = [];
let freq = base;
for (let i=0; i<count; i++) {
_frequencies[i] = freq;
freq *= 2;
} // for
return _frequencies;
} // frequencies
