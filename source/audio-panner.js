import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {Panner} from "./audio-component.js";


let instanceCount  = 0;

class AudioPanner extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-panner">
<legend><h2>[[label]]</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}"></ui-number>
<ui-position label="position" value="{{position}}"></ui-position>

<br><ui-number label="x" value="{{x}}" min="-1000" max="1000" step="0.1" shortcut="alt shift x"></ui-number>
<ui-number label="y" value="{{y}}" min="-1000" max="1000" step="0.1" shortcut="alt shift y"></ui-number>
<ui-number label="z" value="{{z}}" min="-1000" max="1000" step="0.1" shortcut="alt shift z"></ui-number>

<br><ui-number label="orientationX" value="{{orientationX}}" min="-1000" max="1000" step="0.1"></ui-number>
<ui-number label="orientationY" value="{{orientationY}}" min="-1000" max="1000" step="0.1"></ui-number>
<ui-number label="orientationZ" value="{{orientationZ}}" min="-1000" max="1000" step="0.1"></ui-number>

<br><ui-number label="innerAngle" value="{{innerAngle}}" min="0" max="360" step="1"></ui-number>
<ui-number label="outerAngle" value="{{outerAngle}}" min="0" max="360" step="1"></ui-number>
<ui-number label="outerGain" value="{{outerGain}}" min="0" max="1" step="0.1"></ui-number>

<br><ui-text label="distanceModel" value="{{distanceModel}}"></ui-text>
<ui-number label="maxDistance" value="{{maxDistance}}" min="0" max="1000" step="1"></ui-number>
<ui-number label="refDistance" value="{{refDistance}}" min="0" max="1000" step="0.1"></ui-number>
<ui-number label="rolloffFactor" value="{{rolloffFactor}}" min="0" max="100" step="0.1"></ui-number>
</fieldset>
`; // html
} // get template
static get is() { return "audio-panner"; }

static get properties () {
return {
label: String,
position: {type: String, value: "0, 0, 0", notify: true, observer: "positionChanged"},
x: {type: Number, value: 0, notify: true, observer: "xChanged"},
y: {type: Number, value: 0, notify: true, observer: "yChanged"},
z: {type: Number, value: 0, notify: true, observer: "zChanged"},
innerAngle: {type: Number, value: 360, notify: true, observer: "innerAngleChanged"},
outerAngle: {type: Number, value: 360, notify: true, observer: "outerAngleChanged"},
outerGain: {type: Number, value: 0, notify: true, observer: "outerGainChanged"},
distanceModel: {type: String, value: "inverse", notify: true, observer: "distanceModelChanged"},
refDistance: {type: Number, value: 1, notify: true, observer: "refDistanceChanged"},
maxDistance: {type: Number, value: 1000, notify: true, observer: "maxDistanceChanged"},
rolloffFactor: {type: Number, value: 5, notify: true, observer: "rolloffFactorChanged"},
orientationX: {type: Number, value: 0, notify: true, observer: "orientationXChanged"},
orientationY: {type: Number, value: 0, notify: true, observer: "orientationYChanged"},
orientationZ: {type: Number, value: 0, notify: true, observer: "orientationZChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioPanner.is}-${instanceCount}`;
this.component = new Panner(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback

xChanged (value) {this.component.panner.positionX.value = value;}
yChanged (value) {this.component.panner.positionY.value = value;}
zChanged (value) {this.component.panner.positionZ.value = value;}

orientationXChanged (value) {this.component.panner.orientationX.value = value;}
orientationYChanged (value) {this.component.panner.orientationY.value = value;}
orientationZChanged (value) {this.component.panner.orientationZ.value = value;}

distanceModelChanged (value) {this.component.panner.distanceModel = value;}
maxDistanceChanged (value) {this.component.panner.maxDistance = value;}
refDistanceChanged (value) {this.component.panner.refDistance = value;}
rolloffFactorChanged(value) {this.component.panner.rolloffFactor = value;}

innerAngleChanged(value) {this.component.panner.coneInnerAngle = value;}
outerAngleChanged(value) {this.component.panner.coneOuterAngle = value;}
outerGainChanged(value) {this.component.panner.coneOuterGain = value;}

positionChanged (value) {
value = value.split(",").map(x => Number(x.trim()));
this.x = value[0];
this.y = value[1];
this.z = value[2];
return value;
} // positionChanged
} // class AudioPan

customElements.define(AudioPanner.is, AudioPanner);
