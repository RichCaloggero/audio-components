import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_} from "./audio-context.js";
import {StereoProcessor} from "./stereoProcessor.js";

let instanceCount  = 0;

const module = class AudioStereoProcessor extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-stereo-processor">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<ui-number label="rotation" value="{{rotation}}" min="-180" max="180" step="1"></ui-number>
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
center: {type: Number, value: 0, notify: true, observer: "centerChanged"},
width: {type: Number, value: 0, notify: true, observer: "widthChanged"},
balance: {type: Number, value: 0, notify: true, observer: "balanceChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;

this.component = new StereoProcessor(this.audio, this);
this._parameters = null;
} // constructor

connectedCallback () {
super.connectedCallback();
this.isReady = true;
} // connectedCallback

rotationChanged (value) {if (this.isReady) this.component.rotation= value;}
centerChanged (value) {if (this.isReady) this.component.center = value;}
widthChanged (value) {if (this.isReady) this.component.width = value;}
balanceChanged (value) {if (this.isReady) this.component.balance = value;}
} // class AudioStereoProcessor

customElements.define(module.is, module);
