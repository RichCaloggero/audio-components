import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";




let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
static get template () {
return html`

<div class="audio-series" role="region" aria-label$="{{label}}">
<span class="label">{{label}}</span>

<ui-boolean name="bypass" label="bypass" value="{{bypass}}"></ui-boolean>

<slot on-slotchange="_handleSlotChange"></slot>
</div>

`; // html
} // get template

static get is() { return "audio-series"; }

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
} // bypass
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioSeries.is + instanceCount;

this._init ();
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
} // connectedCallback

connectAll (nodes) {
if (nodes.length < 1) return;
let firstChild = nodes[0];
let lastChild = nodes[nodes.length-1];
//alert (`series: firstChild = ${firstChild? firstChild.localName : "null"}`);
//alert (`series: lastChild = ${lastChild? lastChild.localName : "null"}`);

if (firstChild._in) {
this._audioIn.connect (firstChild._in);
//alert ("connected to firstChild's in port");
} // if

for (var i=0; i<nodes.length-1; i++) {
let e1 = nodes[i], e2 = nodes[i+1];
window.e1 = e1; window.e2 = e2;

e1._out.connect (e2._in);
} // for

if (lastChild._out) {
this.lastElementChild._out.connect (this._audioOut);
//alert ("connected from lastChild's out port");
} // if

//console.log(`connectAll complete - ${this.label}`);
} // connectAll

} // class AudioSeries

window.customElements.define(AudioSeries.is, AudioSeries);
