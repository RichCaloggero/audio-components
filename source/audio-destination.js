import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
let instanceCount = 0;


class AudioDestination extends _AudioContext_ {
/*static get template () {
return html`
<div class="audio-destination" role="region" aria-label="Audio Destination">
<span>Speakers</span>
</div>

`; // html
}  // get template
*/

static get is() { return "audio-destination"; }

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioDestination.is}-${instanceCount}`;
console.log("audio-destination: context is ", this.audio._name);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.component = new AudioComponent(this.audio, "speakers");
this.component.input.connect(this.audio.destination);
console.log("speakers connected");
} // connectedCallback

} // class AudioDestination

window.customElements.define(AudioDestination.is, AudioDestination);
