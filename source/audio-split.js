import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

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
label: {
type: String, value: ""}, // label
swapOutputs: Boolean,
swapInputs: Boolean
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioSeries.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
this.shadowRoot.querySelector("slot").addEventListener("slotchange", handleSlotChange.bind(this));
} // connectedCallback

childrenAvailable (children) {
setTimeout(() => {
const components = children.map(e => e.component? e.component : e);
const s = audio.createChannelSplitter(2);
const m = audio.createChannelMerger(2);
let channel1, channel2;
if (components.length === 0 || components.length > 2) {
alert("audio-split: must have at least one, and no more than two child elements, usually audio-series");
return;
} // if

if (components.length === 1) {
let channel1 = components[0];
let channel2 = null;
} else {
let channel1 = components[0];
let channel2 = components[1];
} // if

if (channel1) {
channel1.channelCount = 1;
channel1.channelCountMode = "explicit";
s.connect ((channel1.input || channel1), this.swapInputs? 1 : 0, 0);
(channel1.output || channel1).connect (m, 0, this.swapOutputs? 1 : 0);
} // if

if (channel2) {
channel2.channelCount = 1;
channel2.channelCountMode = "explicit";
s.connect ((channel2.input || channel2), this.swapInputs? 0 : 1, 0);
(channel2.output || channel2).connect (m, 1, this.swapOutputs? 0 : 1);
} // if
} // childrenAvailable
} // class AudioSplit

window.customElements.define(AudioSplit.is, AudioSplit);
