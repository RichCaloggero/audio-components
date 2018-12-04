import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount  = 0;

class AudioDelay extends _AudioContext_ {
static get template () {
return html`

<div class="audio-delay" role="region" aria-label$="{{label}}">
<div class="row">
<span class="label">[[label]]</span>

<ui-boolean name="bypass" label="bypass" value="{{bypass}}"></ui-boolean>

</div><div class="row">

<ui-number name="delayTime" label="delay time" value="{{delayTime}}" min="0.0" max="1.0" step="0.0001"></ui-number>

<ui-boolean name="invertPhase" label="invert phase" value="{{invertPhase}}"></ui-boolean>

</div><!-- .row -->

<slot></slot>
</div>

`; // html
} // get template
static get is() { return "audio-delay"; }

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

invertPhase: {
type: Boolean,
value: false,
notify: true,
observer: "_invertPhase"
}, // invertPhase

delayTime: {
type: Number,
value: 0.0,
notify: true,
observer: "delayTimeChanged"
} // delayTime
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioDelay.is + instanceCount;

this._init (audio.createDelay());
this._audioIn.channelCount = this._in.channelCount = this._audioOut.channelCount = this._out.channelCount = this._audioNode.channelCount = 1;
this._audioIn.channelCountMode = this._in.channelCountMode = this._audioOut.channelCountMode = this._out.channelCountMode = this._audioNode.channelCountMode = "explicit";
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck(AudioDelay.is)) {
this.whenAllChildrenLoaded (this.addFieldLabels);
} // if
} // connectedCallback

delayTimeChanged (value) {
this._setParameterValue (this._audioNode.delayTime, value);
} // delayTimeChanged

} // class AudioDelay

window.customElements.define(AudioDelay.is, AudioDelay);
