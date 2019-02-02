import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount  = 0;

class AudioDelay extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-delay">
<legend><h2>{{label}}</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>
<br><ui-boolean label="invert phase" value="{{invertPhase}}"></ui-boolean>
<ui-number label="delay time" value="{{delayTime}}" min="0.0" max="1.0" step="0.00001"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-delay"; }

static get properties () {
return {
delayTime: {type: Number, value: 0.0, notify: true, observer: "delayTimeChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioDelay.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio, "delay");
this.delay = this.audio.createDelay();
this.component.input.connect(this.delay);
this.delay.connect(this.component.wet);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

invertPhaseChanged (value) {this.component.invertPhase(value);}
bypassChanged (value) {this.component.bypass(value);}
mixChanged (value) {this.component.mix(value);}
delayTimeChanged (value) {this.delay.delayTime.value = value;}

} // class AudioDelay

window.customElements.define(AudioDelay.is, AudioDelay);
