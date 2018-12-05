import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount  = 0;

class AudioResonance extends _AudioContext_ {
static get template () {
return html`

<div class="audio-resonance" role="region" aria-label$="{{label}}">
<span class="label">[[label]]</span>

<div class="row" role="region" aria-label="room dimensions">
<ui-number name="width" label="width" value="{{width}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
<ui-number name="depth" label="depth" value="{{depth}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
<ui-number name="height" label="height" value="{{height}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
</div><!-- .row -->

<div class="row" role="region" aria-label="room materials">
<ui-list name="leftWall"  label="left wall" values="{{materials}}"></ui-list>
<ui-list name="rightWall" label="right wall" values="{{materials}}"></ui-list>
<ui-list name="frontWall" label="front wall" values="{{materials}}"></ui-list>
<ui-list name="backWall" label="back wall" values="{{materials}}"></ui-list>
<ui-list name="ceiling" label="ceiling" values="{{materials}}"></ui-list>
<ui-list name="floor" label="floor" values="{{materials}}"></ui-list>
</div><!-- .row -->


<slot></slot>
</div>
`; // html
} // get template

static get is() { return "audio-resonance"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

width: {
type: Number,
value: 1.0,
notify: true,
observer: "widthChanged"
}, // width

depth: {
type: Number,
value: 1.0,
notify: true,
observer: "depthChanged"
}, // depth

height: {
type: Number,
value: 1.0,
notify: true,
observer: "heightChanged"
}, // height


min: {
type: Number, value: 0.0
}, // min

max: {
type: Number, value: 100.0
}, // max

step: {
type: Number, value: 0.1
}, // step

}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioResonance.is + instanceCount;

this._init (audio.createGain());
//this._audioNode.channelCountMode = "explicit";
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck(AudioResonance.is)) {
this.addFieldLabels ();
} // if
} // connectedCallback

gainChanged (value) {
this._setParameterValue (this._audioNode.gain, value);
} // gainChanged

} // class AudioGain

window.customElements.define(AudioResonance.is, AudioResonance);
