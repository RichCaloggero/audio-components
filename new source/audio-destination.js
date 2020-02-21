import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, statusMessage} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount = 0;
//let _destination;
//export function destination () {return _destination;}


const module = class AudioDestination extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-destination">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>
</fieldset>
`; // html
} // get template

static get is() {return "audio-destination";}

constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.component = new AudioComponent(this.audio, "speakers");
this.component.input.connect(this.audio.destination);
this.component.output = null;
} // constructor

connectedCallback () {
super.connectedCallback ();
this.isReady = true;
} // connectedCallback

} // class AudioDestination

customElements.define(module.is, module);
