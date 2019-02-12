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

<br><ui-number label="x" value="{{x}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number label="y" value="{{y}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number label="z" value="{{z}}" min="-1000" max="1000" step="1"></ui-number>

<br><ui-number label="orientationX" value="{{orientationX}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number label="orientationY" value="{{orientationY}}" min="-1000" max="1000" step="1"></ui-number>
<ui-number label="orientationZ" value="{{orientationZ}}" min="-1000" max="1000" step="1"></ui-number>

<br><ui-number label="innerAngle" value="{{innerAngle}}" min="0" max="360" step="1"></ui-number>
<ui-number label="outerAngle" value="{{outerAngle}}" min="0" max="360" step="1"></ui-number>
<ui-number label="outerGain" value="{{outerGain}}" min="0" max="1" step="1"></ui-number>

<br><ui-text label="distanceModel" value="{{distanceModel}}"></ui-text>
<ui-number name="maxDistance" value="{{maxDistance}}" min="0" max="1000" step="1"></ui-number>
<ui-number name="refDistance" value="{{refDistance}}" min="0" max="1000" step="1"></ui-number>
<ui-number name="rolloffFactor" value="{{rolloffFactor}}" min="0" max="100" step="0.1"></ui-number>
</fieldset>
`; // html
} // get template
static get is() { return "audio-panner"; }

static get properties () {
return {
x: {type: Number, value: 0, notify: true, observer: "xChanged"},
y: {type: Number, value: 0, notify: true, observer: "yChanged"},
z: {type: Number, value: 0, notify: true, observer: "zChanged"},
innerAngle: {type: Number, value: 0, notify: true, observer: "innerAngleChanged"},
outerAngle: {type: Number, value: 360, notify: true, observer: "outerAngleChanged"},
outerGain: {type: Number, value: 0, notify: true, observer: "outerGainChanged"},
distanceModel: {type: String, value: "inverse", notify: true, observer: "distanceModelChanged"},
maxDistance: {type: Number, value: 1000, notify: true, observer: "maxDistanceChanged"},
refDistance: {type: Number, value: 1000, notify: true, observer: "refDistanceChanged"},
rolloffFactor: {type: Number, value: 1000, notify: true, observer: "rolloffFactorChanged"},
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
this.component.panner.setOrientation (0.0,0.0,0.0);
this.audio.listener.setOrientation (0.0,0.0,-1.0, 0.0,1.0,0.0);
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback

xChanged (value) {this.component.panner.positionX.value = value;}
yChanged (value) {this.component.panner.positionY.value = value;}
zChanged (value) {this.component.panner.positionZ.value = value;}

distanceModelChanged (value) {this.component.panner.distanceModel = value;}
maxDistanceChanged (value) {this.component.panner.maxDistance = value;}
refDistanceChanged (value) {this.component.panner.refDistance = value;}
rolloffFactorChanged(value) {this.component.panner.rolloffFactor = value;}

innerAngleChanged(value) {this.component.panner.coneInnerAngle = value;}
outerAngleChanged(value) {this.component.panner.coneouterAngle = value;}

} // class AudioPan


customElements.define(AudioPanner.is, AudioPanner);
