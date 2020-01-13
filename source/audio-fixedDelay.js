import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {FixedDelay} from "./fixedDelay.js";

let instanceCount  = 0;

class AudioFixedDelay extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-fixed-delay">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>
<ui-number label="delay" type="number" value="{{delay}}" min="0" max="128" step="1"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-fixed-delay"; }

static get properties () {
return {
delay: {type: Number, value: 0, notify: true, observer: "delayChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioFixedDelay.is}-${instanceCount}`;
this.component = new FixedDelay(this.audio, this.delay, this);
} // constructor

connectedCallback () {
super.connectedCallback();
//signalReady(this);
} // connectedCallback

delayChanged (value) {
this.component.sampleCount = value;
console.debug(`${this.id}: changed sample count to ${value}`);
} // delayChanged
} // class AudioFixedDelay

customElements.define(AudioFixedDelay.is, AudioFixedDelay);
