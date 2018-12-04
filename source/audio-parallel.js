import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount = 0;

class AudioParallel extends _AudioContext_ {
static get template () {
return html`

<div class="audio-parallel" role="region" aria-label$="{{label}}">
<span class="label">{{label}}</span>

<div class="field" data-name="bypass">
<label>bypass</label>
<br><input type="checkbox" checked="{{bypass::change}}" accesskey="x">
</div>

<slot on-slotchange="_handleSlotChange"></slot>
</div>

`; // html
} // get template
static get is() { return "audio-parallel"; }

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
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioParallel.is + instanceCount;

this._init ();
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
} // connectedCallback

connectAll (nodes) {
//console.log(`${this.label}: connecting all ${nodes.length} nodes`);

for (var i=0; i<nodes.length; i++) {
let e = nodes[i];
if (e.localName === "dom-repeat") continue;
//console.log(`${this.label}: connecting ${e.label} in parallel`);
this._audioIn.connect (e._in);
e._out.connect (this._audioOut);
} // for

this._audioOut.gain.value = 1/nodes.length;
} // connectAll



} // class AudioParallel

window.customElements.define(AudioParallel.is, AudioParallel);
