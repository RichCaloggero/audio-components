import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, handleSlotChange} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount = 0;

class AudioSplit extends _AudioContext_ {
static get template () {
return html`
<slot></slot>
`; // html
} // get template
static get is() { return "audio-split"; }

static get properties () {
return {
label: {type: String, value: ""},
swapOutputs: Boolean,
swapInputs: Boolean
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioSplit.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
this.shadowRoot.querySelector("slot").addEventListener("slotchange", handleSlotChange.bind(this));
} // connectedCallback

childrenAvailable (children) {
setTimeout(() => {
const components = children;
const s = audio.createChannelSplitter(2);
const m = audio.createChannelMerger(2);
let channel1, channel2;
if (components.length === 0 || components.length > 2) {
alert("audio-split: must have at least one, and no more than two child elements");
return;
} // if

if (components.length === 1) {
channel1 = components[0];
channel2 = null;
//console.log("audio-split: only one child found");
} else {
channel1 = components[0];
channel2 = components[1];
} // if

try {
if (channel1) {
//console.log(`channel1: ${channel1.id}`);
s.connect (channel1.component.input, this.swapInputs? 1 : 0, 0);
channel1.component.output.connect (m, 0, this.swapOutputs? 1 : 0);
} // if

if (channel2) {
//console.log(`channel2: ${channel2.id}`);
s.connect (channel2.component.input, this.swapInputs? 0 : 1, 0);
channel2.component.output.connect (m, 1, this.swapOutputs? 0 : 1);
} // if

this.component.input.disconnect();
this.component.input.connect(s);
m.connect(this.component.output);
} catch (e) {
console.log(`audio-split: cannot connect; ${e}\n${e.stack}`);
} // try

}, 1); // millisecond timeout
} // childrenAvailable
} // class AudioSplit

window.customElements.define(AudioSplit.is, AudioSplit);
