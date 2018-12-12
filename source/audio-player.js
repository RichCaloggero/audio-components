import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount = 0;

class AudioPlayer extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-player">
<legend><h2>Audio Player</h2></legend>
<ui-text label="Media URL" value="{{src}}"></ui-text>
<button class="play" on-click="play">Play</button>
<button class="back" on-click="back">back</button>
<button class="forward" on-click="forward">forward</button>
</fieldset>
`; // html
} // get template


static get is() { return "audio-player"; }

static get properties() {
return {
src: {type: String, notify: true} // src
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioPlayer.is}-${instanceCount}`;
this.audioElement = document.createElement("audio");
this.audioElement.setAttribute("crossorigin", "anonymous");
console.log("audio-player: AudioContext ", this.audio._name);
} // constructor

connectedCallback  () {
super.connectedCallback();
this._root = (this.shadowRoot || this);
this.audioElement.addEventListener ("ended", (e) => this._root.querySelector(".play").textContent = "play");

this.component = new AudioComponent(this.audio);
this.audioSource = this.audio.createMediaElementSource (this.audioElement);
this.audioSource.connect(this.component.output);
} // connectedCallback

play (e) {
let player = this.audioElement;
if (player.paused) {
player.play();
e.target.textContent = "pause";
} else {
player.pause();
e.target.textContent = "play";
} // if
e.target.focus();
} // play

back (e) {
let player = this._audioElement;
if (player.currentTime < 5) player.currentTime = 0;
else player.currentTime = player.currentTime - 5.0;
} // back

forward (e) {
let player = this._audioElement;
if (player.currentTime < player.duration) player.currentTime = player.currentTime + 5.0;
else player.currentTime = player.duration;
} // forward

} // class AudioPlayer

customElements.define(AudioPlayer.is, AudioPlayer);
