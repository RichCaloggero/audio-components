import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {Rotator} from "./audio-component.js";

let instanceCount  = 0;

class AudioRotator extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-rotator">
<legend><h2>{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<ui-number label="rotation" value="{{rotation}}" min="-90" max="90" step="1"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-rotator"; }

static get properties () {
return {
rotation: {type: Number, value: 0, notify: true, observer: "rotationChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioRotator.is}-${instanceCount}`;

this.component = new Rotator(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

rotationChanged (value) {this.component.setRotation(value);}
} // class AudioRotator

customElements.define(AudioRotator.is, AudioRotator);
