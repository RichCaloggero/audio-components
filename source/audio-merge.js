import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class AudioMerge extends _AudioContext_ {
static get template () {
return html`

<div class="audio-merge" role="region" aria-label$="{{label}}">
<span class="label">[[label]]</span>
<div class="field" data-name="balance">
<label>balance</label>
<br><input class="balance" value="{{balance::change}}" type="number" min="-1.0" max="1.0" step="0.1">
</div>

<slot></slot>
</div>

`; // html
} // get template
static get is() { return "audio-merge"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label
balance: {
type: Number,
value: 0.0,
notify: true,
observer: "balanceChanged"
} // balance
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioMerge.is + instanceCount;

this._in = audio.createChannelSplitter (2);
this._out = audio.createGain ();
this._out.channelCount = 2;
this._out.channelCountMode = "explicit";
this._left = audio.createGain ();
this._right = audio.createGain ();
this._left.channelCount = this._right.channelCount = 1;
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck(AudioMerge.is)) {
this._in.connect (this._left, 0).connect (this._out);
this._in.connect (this._right, 1).connect (this._out);
this.addFieldLabels ();
} // if
} // connectedCallback

balanceChanged (value) {
//alert ("balance not implemented");
} // balanceChanged

} // class AudioMerge

window.customElements.define(AudioMerge.is, AudioMerge);
