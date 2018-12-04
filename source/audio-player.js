import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount = 0;

class AudioPlayer extends _AudioContext_ {
static get template () {
return html`
<div class="audio-player">
<h2>Audio Player</h2>
<div class="row">
<label>URL: <input type="text" value="{{src::change}}"></label>
</div><div class="row">
<button class="play" on-click="play">Play</button>
<button class="back" on-click="back">back</button>
<button class="forward" on-click="forward">forward</button>
</div><!-- .row -->

<audio tabindex="0" aria-label="Player Controls" src="{{src}}" crossorigin="anonymous">
</audio>
</div>
`; // html
} // get template


static get is() { return "audio-player"; }

static get properties() {
return {
src: {
type: String,
value: "",
notify: true,
//observer: "srcChanged"
} // src
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioPlayer.is + instanceCount;

this._audioIn = this._audioOut = null;
this._in = null;
this._out = audio.createGain();
} // constructor

connectedCallback  () {
super.connectedCallback();
if (!this.shadowRoot) {
throw Error ("audio-player: not properly initialized");
return;
} // if

this._audioElement = this.shadowRoot.querySelector("audio");
this._audioElement.addEventListener ("ended", (e) => this.shadowRoot.querySelector(".play").textContent = "play");

//if (this.contextCheck(AudioPlayer.is)) {
this._audioIn = this._audioOut= audio.createMediaElementSource (this._audioElement);
this._connect ();
//} // if
} // connectedCallback

play (e) {
let player = this._audioElement;
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
