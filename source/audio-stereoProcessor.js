import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {StereoProcessor} from "./stereoProcessor.js";

let instanceCount  = 0;

class AudioStereoProcessor extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-stereo-processor">
<legend><h2>{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<ui-number label="rotation" value="{{rotation}}" min="-90" max="90" step="1"></ui-number>
<ui-number label="center" value="{{center}}" min="-100.0" max="100.0" step="1"></ui-number>
<ui-number label="width" value="{{width}}" min="0.0" max="200.0" step="1"></ui-number>
<ui-number label="balance" value="{{balance}}" min="-100.0" max="100.0" step="1"></ui-number>


</fieldset>
`; // html
} // get template

static get is() { return "audio-stereo-processor"; }

static get properties () {
return {
rotation: {type: Number, value: 0, notify: true, observer: "rotationChanged"},
center: {type: Number, value: 0, notify: true, observer: "_setEnhancer"},
width: {type: Number, value: 0, notify: true, observer: "_setEnhancer"},
balance: {type: Number, value: 0, notify: true, observer: "_setEnhancer"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioStereoProcessor.is}-${instanceCount}`;

this.component = new StereoProcessor(this.audio, this);
this._parameters = null;
} // constructor

connectedCallback () {
super.connectedCallback();
//signalReady(this);
} // connectedCallback

rotationChanged (value) {this.component.setRotation(value);}

_setEnhancer (center, width, balance) {
const parameters = [this.center, this.width, this.balance];
if (parameters.some(Number.isNaN)) return;
if (this._parameters && parameters.every((value,i) => this._parameters[i] === value)) return;
this._parameters = parameters;

this.component.setEnhancer(...parameters);
} // _setEnhancer

} // class AudioStereoProcessor

customElements.define(AudioStereoProcessor.is, AudioStereoProcessor);
