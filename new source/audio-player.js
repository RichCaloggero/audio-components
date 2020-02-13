import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, statusMessage, shadowRoot, registerAudioPlayer} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
import {handleUserKey} from "./ui.js";

let instanceCount = 0;

const module = class AudioPlayer extends _AudioContext_ {
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
this.id = `${module.is}-${instanceCount}`;
this.module = module;

this.component = new AudioComponent(this.audio, "player");
this.component.input = null;

if (this.audio && this.audio instanceof AudioContext && this.audio.createMediaElementSource) {
this.audioElement = document.createElement("audio");
this.audioElement.setAttribute("crossorigin", "anonymous");
this.audioElement.addEventListener("error", e => statusMessage(`${this.id}: ${e.target.error.message}`));
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
this.isReady = true;
console.debug(`${this.id} called signalReady()`);
} // connectedCallback


srcChanged (value) {
if (this.isReady && value && this.audioElement) {
this.audioElement.src = this.component.src = value;
} // if
} // srcChanged

isPlaying () {return this.isReady? this.shadowRoot.querySelector(".play").getAttribute("aria-pressed") === "true" : false;}

play (e) {
if (!this.isReady) return;
const player = this.audioElement;
if (player.paused) {
player.play();
e.target.textContent = "pause";

} else {
player.pause();
e.target.textContent = "play";
} // if

e.target.focus();
//console.debug(`${this.id}: player is ${player.paused? "paused" : "playing"}`);
} // play

back (e) {
if (!this.isReady) return;
const player = this.audioElement;
if (player.currentTime < 5) player.currentTime = 0;
else player.currentTime = player.currentTime - 5.0;
} // back

forward (e) {
if (!this.isReady) return;
const player = this.audioElement;
if (player.currentTime < player.duration) player.currentTime = player.currentTime + 5.0;
else player.currentTime = player.duration;
} // forward




handleSpecialKeys (e) {
if (handleUserKey(e)) e.preventDefault();
} // handleSpecialKeys
} // class AudioPlayer

customElements.define(module.is, module);


