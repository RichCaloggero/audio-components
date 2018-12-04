import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount = 0;

class AudioOscillator extends _AudioContext_ {
static get template () {
return html`

<div class="audio-oscillator" role="region" aria-label$="{{label}}">
<span class="label">{{label}}</span>

<ui-list name="type" label="type" value="{{type}}" values="sine, square, triangle"></ui-list>
<ui-number name="frequency" label="frequency" value="{{frequency}}" min="0.0" max="20000.0" step="10.0"></ui-number>
<ui-boolean name="play" label="play" value="{{play}}" key="p"></ui-boolean>

<slot></slot>
</div>
`; // html
} // get template
static get is() { return "audio-oscillator"; }

static get properties() {
return {
label: {
type: String,
value: ""
}, // label

type: {
type: String,
value: "sine",
notify: true,
observer: "typeChanged"
}, // type

frequency: {
type: Number,
value: 1000.0,
notify: true,
observer: "frequencyChanged"
}, // frequency
	
play: {
type: Boolean,
observer: "playChanged"
} // play
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioOscillator.is + instanceCount;

this.__init ();
console.log ("audio-oscillator created");
} // constructor

__init () {
this._in = this._audioIn = null;
this._out = audio.createGain ();
this._audioOut = audio.createGain ();
this._audioOut.connect (this._out);

let create = () => {
this._audioNode = audio.createOscillator ();

this._audioNode.frequency.value = this.frequency;
this._audioNode.type = this.type;

this._audioNode.connect (this._audioOut);
this._audioNode.onended = create;
console.log (`${this._id} recreated`);
} // create

console.log (`creating oscillator ${this._id}`);
create ();
} // _init

connectedCallback  () {
super.connectedCallback();
this.addFieldLabels ();
} // connectedCallback

frequencyChanged (value) {
this._setParameterValue (this._audioNode.frequency, value);
} // frequencyChanged

typeChanged (value) {
this._audioNode.type = value;
} // typeChanged

playChanged (value) {
if (value) {
this._isPlaying = true;
this._audioNode.start();
} else if (this._isPlaying) {
this._isPlaying = false;
this._audioNode.stop ();
} // if
} // playChanged

} // class AudioOscillator

window.customElements.define(AudioOscillator.is, AudioOscillator);
