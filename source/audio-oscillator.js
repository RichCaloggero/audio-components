import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady, statusMessage} from "./audio-context.js";
import {Oscillator} from "./audio-component.js";

let instanceCount = 0;

class AudioOscillator extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-oscillator">
<legend><h2>[[label]]</h2></legend>

<ui-list label="type" value="{{type}}" values='["sine", "square", "sawtooth", "triangle"]'></ui-list>
<ui-number label="frequency" value="{{frequency}}" min="0.0" max="20000.0" step="10.0"></ui-number>
<ui-number label="detune" value="{{detune}}" min="0.0" max="100.0" step="1.0"></ui-number>
<ui-boolean label="play" value="{{play}}" key="p"></ui-boolean>
</fieldset>
`; // html
} // get template
static get is() { return "audio-oscillator"; }

static get properties() {
return {
type: String,
frequency: Number,
detune: Number,
//type: {type: String, notify: true, observer: "typeChanged"},
//frequency: {type: Number, notify: true, observer: "frequencyChanged"},
//detune: {type: Number, notify: true, observer: "detuneChanged"},
play: {type: Boolean, notify: true, observer: "playChanged"},
}; // return
} // get properties

static get observers () {
return [
"_update(type, frequency, detune)"
];
} // get observers

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioOscillator.is}-${instanceCount}`;
this.options = {type: "", frequency: 0, detune: 0};
this.component = new Oscillator(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

_update (type, frequency, detune) {
this.options = {type, frequency, detune};
this.component.set(this.options);
} // _update

playChanged (value) {
if (value) {
this.component.set(this.options);
this.component.start();
} else {
this.component.stop();
} // if
} // playChanged
} // class AudioOscillator

customElements.define(AudioOscillator.is, AudioOscillator);
