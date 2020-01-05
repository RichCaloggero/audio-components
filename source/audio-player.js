import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady, statusMessage, shadowRoot, registerAudioPlayer} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
import {handleUserKey} from "./ui.js";

let instanceCount = 0;

class AudioPlayer extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-player">
<legend><h2>[[label]]</h2></legend>
<ui-text label="Media URL" shortcut="alt shift u" value="{{src}}"></ui-text>
<button class="play" aria-pressed="false" on-click="play" on-keydown="handleSpecialKeys">Play</button>
<button class="back" on-click="back">back</button>
<button class="forward" on-click="forward">forward</button>
</fieldset>
`; // html
} // get template


static get is() { return "audio-player"; }

static get properties() {
return {
src: {type: String, notify: true, observer: "srcChanged"},
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioPlayer.is}-${instanceCount}`;

this.component = new AudioComponent(this.audio, "player");
this.component.input = null;

if (this.audio && this.audio instanceof AudioContext && this.audio.createMediaElementSource) {
this.audioElement = document.createElement("audio");
this.audioElement.setAttribute("crossorigin", "anonymous");
this.audioSource = this.audio.createMediaElementSource(this.audioElement);
this.audioSource.connect(this.component.output);
this.component.audioSource = this.audioSource;
this.component.src = "";
} else {
this.audioSource = this.component.audioSource = null;
} // if

registerAudioPlayer(this.component);
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback


srcChanged (value) {
if (value && this.audioElement) {
this.audioElement.src = this.component.src = value;
} // if
} // srcChanged

isPlaying () {return this.shadowRoot.querySelector(".play").getAttribute("aria-pressed") === "true";}

play (e) {
const player = this.audioElement;
if (player.paused) {
try {
player.play();

} catch (e) {
statusMessage(`audio-player: ${e}`);
} // try
e.target.textContent = "pause";
} else {
player.pause();
e.target.textContent = "play";
} // if

e.target.focus();
//console.log(`${this.id}: player is ${player.paused? "paused" : "playing"}`);
} // play

back (e) {
const player = this.audioElement;
if (player.currentTime < 5) player.currentTime = 0;
else player.currentTime = player.currentTime - 5.0;
} // back

forward (e) {
const player = this.audioElement;
if (player.currentTime < player.duration) player.currentTime = player.currentTime + 5.0;
else player.currentTime = player.duration;
} // forward


/*updateAudioSource () {
this.shadowRoot.querySelector(".play").setAttribute("aria-pressed", "false")
if (!this.audioBuffer) {
alert("no buffer");
return;
} // if

if (this.audioSource) this.audioSource.disconnect();
this.audioSource = this.audio.createBufferSource();
this.audioSource.buffer = this.audioBuffer;
this.audioSource.connect (this.component.output);
this.component.audioSource = this.audioSource;
this.audioSource.addEventListener("ended", () => this.updateAudioSource());
} // updateSource
*/


handleSpecialKeys (e) {
if (handleUserKey(e)) e.preventDefault();
} // handleSpecialKeys
} // class AudioPlayer

customElements.define(AudioPlayer.is, AudioPlayer);


