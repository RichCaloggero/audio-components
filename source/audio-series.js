import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
static get template () {
return html`

<div class="audio-series">

<slot></slot>
</div>

`; // html
} // get template

static get is() { return "audio-series"; }

static get properties () {
return {
label: String
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioSeries.is}-${instanceCount}`;
console.log("audio-series: AudioContext ", this.audio._name);
} // constructor

_attachDom (dom) {
this.appendChild(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
//_AudioContext_.waitForChildren(this);
const series = Array.from(this.children).filter(element => element.localName.includes("-"))
.map(element => {
//console.log("series: element is ", element, element.component);
return (element.component || element)
});

this.component = new Series(this.audio, series);
this.component.mix(1); // all wet
} // connectedCallback

/*connectAll (nodes) {
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
*/

} // class AudioSeries

window.customElements.define(AudioSeries.is, AudioSeries);
