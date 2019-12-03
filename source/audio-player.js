/* bufferToWave: https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/ */

import {bufferToWave} from "./bufferToWave.js";
import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady, statusMessage, shadowRoot} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
import {handleUserKey} from "./ui.js";

let instanceCount = 0;

class AudioPlayer extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-player">
<legend><h2>[[label]]</h2></legend>
<ui-text label="Media URL" shortcut="alt shift u" value="{{src}}"></ui-text>
<button class="play" on-click="play" on-keydown="handleSpecialKeys">Play</button>
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

if (this.offline) {
this.audioSource = this.audio.createBufferSource();
alert("offline...");
} else {
this.audioElement = document.createElement("audio");
this.audioElement.setAttribute("crossorigin", "anonymous");
this.audioSource = this.audio.createMediaElementSource (this.audioElement);
} // if

this.component = new AudioComponent(this.audio, "player");
this.component.input = null;
this.audioSource.connect(this.component.output);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.audioElement.addEventListener ("ended", e => this.shadowRoot.querySelector(".play").textContent = "play");
signalReady(this);
} // connectedCallback

srcChanged (value) {
if (value) {
if (this.offline) this.loadAudio(value);
else this.audioElement.src = value;
} // if
} // srcChanged

play (e) {
if (this.offline) {
this.render();
return;
} // if

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
console.log(`${this.id}: player is ${player.paused? "paused" : "playing"}`);
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

loadAudio(url) {
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
this.audioSource.buffer = buffer;
alert(`${buffer.duration} seconds of audio loaded.`);
}).catch(error => alert (error));
} // loadAudio

render () {
audioSource.start();
statusMessage("Rendering audio, please wait...");

this.audio.startRendering()
.then(buffer => {
const audioElement = document.createElement("audio");
statusMessage(`Render complete: ${Math.round(buffer.duration)} seconds of audio processed.`);
audioElement.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
audioElement.setAttribute("controls", "");
audioElement.setAttribute("tabindex", "0");
shadowRoot.appendChild(audioElement);
audioElement.focus();
}).catch(error => alert(error));
} // render

finalizeRecording (buffer) {
} // finalizeRecording

handleSpecialKeys (e) {
if (handleUserKey(e)) e.preventDefault();
} // handleSpecialKeys
} // class AudioPlayer

customElements.define(AudioPlayer.is, AudioPlayer);

