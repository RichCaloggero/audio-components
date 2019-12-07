import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady, statusMessage} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount = 0;
let _destination;
export function destination () {return _destination;}


class AudioDestination extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-destination">
<legend><h2>Speakers</h2></legend>
</fieldset>
`; // html
}  // get template

static get is() { return "audio-destination"; }

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioDestination.is}-${instanceCount}`;
this.ui = false;
this.component = new AudioComponent(this.audio, "speakers");
this.component.input.connect(this.audio.destination);
this.component.output = null;
//audioDestination (this.component);

} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback


} // class AudioDestination

window.customElements.define(AudioDestination.is, AudioDestination);
