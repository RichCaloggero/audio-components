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
src: {type: String, notify: true, observer: "srcChanged"}
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioPlayer.is}-${instanceCount}`;
this.audioElement = document.createElement("audio");
this.audioElement.setAttribute("crossorigin", "anonymous");
this.audioSource = this.audio.createMediaElementSource (this.audioElement);

this.component = new AudioComponent(this.audio, "player");
this.component.input = null;
this.audioSource.connect(this.component.output);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.audioElement.addEventListener ("ended", (e) => this.shadowRoot.querySelector(".play").textContent = "play");
} // connectedCallback

srcChanged (value) {
if (value) this.audioElement.src = value;
} // srcChanged

play (e) {
const player = this.audioElement;
if (player.paused) {
try {player.play();}
catch (e) {alert (`audio-player: ${e}`);}
e.target.textContent = "pause";
} else {
player.pause();
e.target.textContent = "play";
} // if

e.target.focus();
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

} // class AudioPlayer

customElements.define(AudioPlayer.is, AudioPlayer);
