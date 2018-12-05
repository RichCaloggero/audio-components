import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";



let instanceCount = 0;

class AudioXtc extends _AudioContext_{
static get template () {
return html`
<div class="audio-xtc" role="region" aria-label$="{{label}}">
<span class="label">[[label]]</span>

<ui-boolean name="bypass" value="{{bypass}}"></ui-boolean>

<audio-parallel><audio-series>

<!-- this branch passes input to output -->
<audio-gain gain="1.6"></audio-gain>

</audio-series><audio-series>

<!-- this branch does the phase inversion and delay (invert phase done via thd delay component itself, although it could be implemented in HTML instead, but would be much more verbose (need for abstraction) -->

<audio-feedback label="feedback" gain="0.3">
<audio-split id="swapper" swap-outputs><audio-series>
<audio-delay label="left delay" delay-time="0.0002" invert-phase></audio-delay>
</audio-series><audio-series>
<audio-delay label="right delay" delay-time="0.0002" invert-phase></audio-delay>
</audio-series></audio-split>

<audio-filter label="frequency correction" type="allpass" frequency="2000.0" q="0.55" hide-controls="gain detune"></audio-filter>
</audio-feedback>

<!-- makeup gain -->
<audio-gain gain="1.5"></audio-gain>

<audio-gain label="wet level" gain="0.4"></audio-gain>
</audio-series></audio-parallel>
</div><!-- .audio-xtc -->
`; // html
} // get template
static get is () {return "audio-xtc";}

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

bypass: {
type: Boolean,
notify: true,
observer: "_bypass"
}, // bypass

/*mix: {
type: Number,
value: 0.5,
notify: true,
observer: "mixChanged"
} // mix
*/

}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = "audio-xtc" + instanceCount;
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

mixChanged (value) {
let self = this.shadowRoot;
let dry = self.querySelector(".dry-level");
let wet = self.querySelector (".wet-level");
wet.gain = value;
dry.gain = 1 - value;
} // mixChanged

} // class AudioXtc

window.customElements.define(AudioXtc.is, AudioXtc);