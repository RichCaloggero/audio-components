import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";
import {RoomSimulator} from "./room.js";

let instanceCount  = 0;

class AudioResonance extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-resonance">
<legend><h2>{{label}}</h2></legend>

<fieldset>
<legend><h3>mix</h3></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>
</fieldset>

<fieldset>
<legend><h3>room</h3></legend>
<ui-number label="size" value="{{size}}" min="0" max="500" step=".05"></ui-number>
<ui-list label="floor" value="{{floor}}" values="{{meterialsList}}"></ui-list>
<ui-list label="ceiling" value="{{ceiling}}" values="{{meterialsList}}"></ui-list>
<ui-list label="left wall" value="{{leftWall}}" values="{{meterialsList}}"></ui-list>
<ui-list label="right wall" value="{{rightWall}}" values="{{meterialsList}}"></ui-list>
<ui-list label="front wall" value="{{frontWall}}" values="{{meterialsList}}"></ui-list>
<ui-list label="back wall" value="{{backWall}}" values="{{meterialsList}}"></ui-list>

</fieldset>

<fieldset>
<legend><h3>position</h3></legend>
</fieldset>
</fieldset>
`; // html
} // get template

static get is() { return "audio-resonance"; }

static get properties () {
return {
label: String,
bypass: {type: Boolean, value: false, notify: true, observer: "bypassChanged"},
mix: {type: Number, value: 1, notify: true, observer: "mixChanged"},
room: {type: Object, notify: true, observer: "roomChanged"},

}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioResonance.is}-${instanceCount}`;

this.scene = createScene();
console.log("- scene created");
this.component = new RoomSimulator(this.audio, this.scene);
console.log("- RoomSimulator created");
console.log(`${this.id} created`);

function createScene (order = 3) {
const scene = new ResonanceAudio(audio);
scene.setAmbisonicOrder(order);
return scene;
} // createScene

console.log(`${this.id} created.`);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.materialsList = RoomSimulator.materialsList();
console.log(`${this.id}: DOM created.`);
} // connectedCallback


bypassChanged (value) {
if (this.component) this.component.bypass(value);
} // bypassChanged

mixChanged (value) {
if (this.component) this.component.mix(value);
} // mixChanged

frequencyChanged (value) {this.filter.frequency.value = value;}
qChanged (value) {this.filter.Q.value = value;}
typeChanged (value) {this.filter.type = value;}
detuneChanged (value) {this.filter.detune.value = value;}
gainChanged (value) {this.filter.gain.value = value;}

} // class AudioGain

window.customElements.define(AudioResonance.is, AudioResonance);
