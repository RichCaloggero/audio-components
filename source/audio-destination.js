import {PolymerElement, html} from "@polymer/polymer/polymer-element.js";


class AudioDestination extends _AudioContext_ {
static get template () {
return html`

<div class="audio-destination" role="region" aria-label="Audio Destination">
<span>Speakers</span>
</div>

`; // html
}  // get template
static get is() { return "audio-destination"; }

constructor () {
super ();
this.label = "audio-destination";
this._audioIn = this._audioOut = audio.destination;
this._in = audio.createGain ();
this._out = null;
} // constructor

connectedCallback () {
super.connectedCallback ();
if (this.contextCheck (AudioDestination.is)) {
this._connect ();
} // if
} // connectedCallback

} // class AudioDestination

window.customElements.define(AudioDestination.is, AudioDestination);
