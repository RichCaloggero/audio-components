import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
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

<fieldset>
<legend><h4>Dimensions</h4></legend>
<ui-number label="width" value="{{room.dimensions.width}}" min="0.0" max="100.0" step="0.1"></ui-number>
<ui-number label="depth" value="{{room.dimensions.depth}}" min="0" max="100" step="0.1"></ui-number>
<ui-number label="height" value="{{room.dimensions.height}}" min="0" max="100" step="0.1"></ui-number>
</fieldset>

<fielset>
<legend><h4>Materials</h4></legend>
<ui-list label="floor" value="{{room.materials.down}}" values="{{materialsList}}"></ui-list>
<ui-list label="ceiling" value="{{room.materials.up}}" values="{{materialsList}}"></ui-list>
<ui-list label="left wall" value="{{room.materials.left}}" values="{{materialsList}}"></ui-list>
<ui-list label="right wall" value="{{room.materials.right}}" values="{{materialsList}}"></ui-list>
<ui-list label="front wall" value="{{room.materials.front}}" values="{{materialsList}}"></ui-list>
<ui-list label="back wall" value="{{room.materials.back}}" values="{{materialsList}}"></ui-list>
</fieldset>

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

static get observers () {
return [
"roomChanged(room.*)"
]; // return
} // get observers

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioResonance.is}-${instanceCount}`;

this.scene = createScene(this.audio);
//console.log("- scene created");
this.component = new RoomSimulator(this.audio, this.scene);
//console.log("- RoomSimulator created");

this.room = RoomSimulator.defaultRoom();
this.component.updateRoom(this.room);

function createScene (audio, order = 3) {
const scene = new ResonanceAudio(audio);
scene.setAmbisonicOrder(order);
return scene;
} // createScene
} // constructor

connectedCallback () {
super.connectedCallback ();
this.materialsList = RoomSimulator.materialsList();
signalReady(this);
} // connectedCallback


bypassChanged (value) {if (this.component) this.component.bypass(value);}
mixChanged (value) {if (this.component) this.component.mix(value);}

roomChanged (data) {
//console.log(`roomChanged: ${data.toSource()}`);

const room = this.component.updateRoom(data.base? data.base : data);
const width = room.dimensions.width;

this.component.setPosition([-1*width/2,0,0], [width/2,0,0]);
} // roomChanged

} // class AudioResonance

window.customElements.define(AudioResonance.is, AudioResonance);
