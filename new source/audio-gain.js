import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, signalReady} from "./audio-context.js";
import {Gain} from "./audio-component.js";

let instanceCount  = 0;

const module = class AudioGain extends _AudioContext_ {
static get template () {
return html`
<fieldset>
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>
<ui-number label="gain" value="{{gain}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-gain"; }

static get properties () {
return {
gain: {type: Number, value: 1.0, notify: true, observer: "gainChanged"}, // gain

min: {type: Number, value: -2.0}, // min
max: {type: Number, value: 2.0}, // max
step: {type: Number, value: 0.1}, // step
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;

this.component = new Gain(this.audio, this.gain, this);
} // constructor

connectedCallback () {
super.connectedCallback();
this.isReady = true;
} // connectedCallback

gainChanged (value) {if (this._ready) this.component.gain = value;}
} // class AudioGain

customElements.define(module.is, module);
