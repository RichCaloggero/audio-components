import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {Verb} from "./audio-component.js";

let instanceCount  = 0;

class AudioVerb extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-verb">
<legend><h2>{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>

<ui-number label="minDelay" type="number" value="{{minDelay}}" min="0.00001" max="1.0" step="0.00001"></ui-number>
<ui-number label="maxDelay" type="number" value="{{maxDelay}}" min="0.00001" max="1.0" step="0.00001"></ui-number>

<ui-number label="minGain" type="number" value="{{minGain}}" min="0.0" max="0.98" step="0.01"></ui-number>
<ui-number label="maxGain" type="number" value="{{maxGain}}" min="0.0" max="0.98" step="0.01"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-verb"; }

static get properties () {
return {
minDelay: {type: Number, value: 0.001, notify: true, observer: "_setDelays"},
maxDelay: {type: Number, value: 1.0, notify: true, observer: "_setDelays"},

minGain: {type: Number, value: 0.1, notify: true, observer: "_setDelays"},
maxGain: {type: Number, value: 0.98, notify: true, observer: "_setDelays"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioVerb.is}-${instanceCount}`;

this.component = new Verb(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

_setDelays () {
const parameters = [this.minDelay, this.maxDelay, this.minGain, this.maxGain];
if (parameters.some(Number.isNaN)) return;
if (this._parameters && parameters.every((value,i) => this._parameters[i] === value)) return;
this._parameters = parameters;

this.component.setDelays(...parameters);
} // _setDelays

} // class AudioVerb

customElements.define(AudioVerb.is, AudioVerb);
