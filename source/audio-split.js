import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount = 0;

class AudioSplit extends _AudioContext_ {
static get template () {
return html`
<div class="audio-split">
<slot></slot>
</div>

`; // html
} // get template
static get is() { return "audio-split"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

swapOutputs: Boolean,
swapInputs: Boolean
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioSplit.is + instanceCount;

this._in = audio.createChannelSplitter (2);
this._out = audio.createChannelMerger (2);
} // constructor

connectedCallback () {
super.connectedCallback ();

this.whenAllChildrenLoaded (this.connectAll);
} // connectedCallback

connectAll (nodes) {
var channel1, channel2, gain = audio.createGain();

if (nodes.length === 0) {
alert ("split must have 1 or 2 children");
return;
} else if (nodes.length === 1) {
channel1 = this.firstElementChild;
channel2 = null;
} else {
channel1 = this.firstElementChild;
channel2 = this.lastElementChild;
} // if

if (channel1) {
channel1.channelCount = 1;
channel1.channelCountMode = "explicit";
this._in.connect (channel1._in, this.swapInputs? 1 : 0, 0);
channel1._out.connect (this._out, 0, this.swapOutputs? 1 : 0);
} // if

if (channel2) {
//console.log("split: channel2");
channel2.channelCount = 1;
channel2.channelCountMode = "explicit";
this._in.connect (channel2._in, this.swapInputs? 0 : 1, 0);
channel2._out.connect (this._out, 0, this.swapOutputs? 0 : 1);
} // if

//console.log(`connectAll complete - ${this.label}`);
} // connectAll

} // class AudioSplit

window.customElements.define(AudioSplit.is, AudioSplit);
