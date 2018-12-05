import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class AudioPan extends _AudioContext_ {
static get template () {
return html`

<div class="audio-pan" role="region" aria-label$="{{label}}">
<div class="row">
<span class="label">{{label}}</span>

<div class="field" data-name="bypass">
<label>bypass</label>
<br><input type="checkbox" checked="{{bypass::change}}">
</div>

</div><div class="row">

<ui-number name="x" value="{{x}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number name="y" value="{{y}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number name="z" value="{{z}}" min="-1000" max="1000" step="1"></ui-number>

</div><div class="row">
<ui-number name="maxDistance" value="{{maxDistance}}" min="0" max="1000" step="1"></ui-number>
<ui-number name="refDistance" value="{{refDistance}}" min="0" max="1000" step="1"></ui-number>
<ui-number name="rolloffFactor" value="{{rolloffFactor}}" min="0" max="100" step="0.1"></ui-number>

</div><div class="row">
<div class="field" data-name="coneInnerAngle">
<label>cone inner angle</label>
<br><input type="number" value="{{coneInnerAngle::change}}">
</div>

<div class="field" data-name="coneOuterAngle">
<label>cone outer angle</label>
<br><input type="number" value="{{coneOuterAngle::change}}">
</div>

<div class="field" data-name="coneOuterGain">
<label>cone outer gain</label>
<br><input type="number" value="{{coneOuterGain::change}}">
</div>

</div><div class="row">
<slot></slot>
</div><!-- .row -->

</div>
`; // html
} // get template
static get is() { return "audio-pan"; }

static get properties () {
return {
bypass: {
type: Boolean,
value: false,
notify: true,
observer: "_bypass"
}, // bypass

label: {
type: String,
value: ""
}, // label

x: {
audioParam: "positionX",
type: Number,
value: 0.0,
notify: true,
observer: "xChanged"
}, // x

y: {
audioParam: "positionY",
type: Number,
value: 0.0,
notify: true,
observer: "yChanged"
}, // y

z: {
audioParam: "positionZ",
type: Number,
value: 0.0,
notify: true,
observer: "zChanged"
}, // z

coneInnerAngle: {
type: Number,
value: 0.0,
notify: true,
observer: "coneInnerAngleChanged"
}, // coneInnerAngle
coneOuterAngle: {
type: Number,
value: 360.0,
notify: true,
observer: "coneOuterAngleChanged"
}, // coneOuterAngle
coneOuterGain: {
type: Number,
value: 0.0,
notify: true,
observer: "coneOuterGainChanged"
}, // coneOuterGain

distanceModel: {
type: String,
value: "inverse"
} , // distanceModel

maxDistance: {
type: Number,
value: 100.0,
notify: true,
observer: "maxDistanceChanged"
}, // maxDistance

refDistance: {
type: Number,
value: 1.0,
notify: true,
observer: "refDistanceChanged"
}, // refDistance

rolloffFactor: {
type: Number,
value: 1.0,
notify: true,
observer: "rolloffFactorChanged"
}, // rolloffFactor

orientationX: Number,
orientationY: Number,
orientationZ: Number,

}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioPan.is + instanceCount;

this._init (audio.createPanner ());
this._audioNode.panningModel = "HRTF";
this._audioNode.distanceModel = "linear";
this._audioNode.setOrientation (0.0,0.0,0.0);
audio.listener.setOrientation (0.0,0.0,-1.0, 0.0,1.0,0.0);
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck(AudioPan.is)) {
this.addFieldLabels ();
} // if
} // connectedCallback

xChanged (value) {
this._setParameterValue (this._audioNode.positionX, value);
} // xChanged

yChanged (value) {
this._setParameterValue (this._audioNode.positionY, value);
} // yChanged

zChanged (value) {
this._setParameterValue (this._audioNode.positionZ, value);
} // zChanged

maxDistanceChanged (value) {
this._audioNode.maxDistance = value;
} // maxDistanceChanged


refDistanceChanged (value) {
this._audioNode.refDistance = value;
} // refDistanceChanged

rolloffFactorChanged(value) {
this._audioNode.rolloffFactor = value;
} // rolloffFactorChanged

coneInnerAngleChanged(value) {
this._audioNode.coneInnerAngle = value;
} // coneInnerAngleChanged


} // class AudioPan


window.customElements.define(AudioPan.is, AudioPan);