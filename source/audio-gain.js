import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount  = 0;

class AudioGain extends _AudioContext_ {
static get template () {
return html`
<fieldset>
<legend><h2>{{label}}</h2></legend>
<ui-number label="gain" value="{{gain}}" min="{{min}}" max="{{max}}" step="{{step}}"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-gain"; }

static get properties () {
return {
label: String,
gain: {
type: Number,
value: 1.0,
notify: true,
observer: "gainChanged"
}, // gain

min: {type: Number, value: -2.0}, // min
max: {type: Number, value: 2.0}, // max
step: {type: Number, value: 0.1}, // step
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioGain.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio, "gain");
console.log(`${this.id} created, shadow = ${this.shadowRoot}`);
} // constructor

connectedCallback () {
super.connectedCallback();
} // connectedCallback

gainChanged (value) {
this._setParameterValue (this.component.output.gain, value);
} // gainChanged

} // class AudioGain

window.customElements.define(AudioGain.is, AudioGain);
