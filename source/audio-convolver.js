import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, audio, signalReady, statusMessage} from "./audio-context.js";
import {Convolver} from "./audio-component.js";

let instanceCount  = 0;

class AudioConvolver extends _AudioContext_ {
static get template () {
return html`

<fieldset class="audio-convolver">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}"></ui-number>
<ui-list label="impulse" value="{{impulse}}" values="{{impulses}}"></ui-list>
</fieldset>
`; // html
} // get template

static get is() { return "audio-convolver"; }

static get properties () {
return {
path: {type: String, value: "."},
extension: {type: String, value: ".wav"},
impulse: {type: String, notify: true, observer: "impulseChanged"},
impulses: {type: String, notify: true, value: `[
"Cement Blocks 2",
"Cement Blocks 1",
"Chateau de Logne, Outside",
"Conic Long Echo Hall",
"Deep Space",
"Derlon Sanctuary",
"Bottle Hall",
"Direct Cabinet N1",
"Direct Cabinet N2",
"Direct Cabinet N3",
"Direct Cabinet N4",
"French 18th Century Salon",
"Five Columns Long",
"Five Columns",
"Going Home",
"Greek 7 Echo Hall",
"In The Silo",
"In The Silo Revised",
"Highly Damped Large Room",
"Large Bottle Hall",
"Large Long Echo Hall",
"Large Wide Echo Hall",
"Masonic Lodge",
"Musikvereinsaal",
"Narrow Bumpy Space",
"Nice Drum Room",
"On a Star",
"Parking Garage",
"Rays",
"Right Glass Triangle",
"Ruby Room",
"Scala Milan Opera Hall",
"Small Prehistoric Cave",
"Small Drum Room",
"St Nicolaes Church",
"Grig Room",
"Vocal Duo"
]`} // impulses
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioConvolver.is}-${instanceCount}`;
this.component = new Convolver(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback ();
signalReady(this);
} // connectedCallback

impulseChanged (value) {
console.debug(`${this.id}.impulseChanged: ${value}`);
if (value) {
const url = `${this.path}/${value}${this.extension}`;
console.debug(`- url is ${url}`);
loadImpulse(url, (buffer) => {
this.component.setImpulse(buffer);
}); // load
} // if
} // impulseChanged
} // class AudioConvolver

customElements.define(AudioConvolver.is, AudioConvolver);


function decodeBuffer(arrayBuffer, callback) {
audio.decodeAudioData(arrayBuffer, function (audioBuffer) {
if (typeof callback === "function" && audioBuffer !== null) {
callback(audioBuffer);
} else {
throw new Error ("loadImpulse: missing callback");
} // if
}, function (e) {
statusMessage(`Could not decode audio data: ${e}`);
}); // decode
} // decodeBuffer

function loadImpulse (url, callback) {
const request = new XMLHttpRequest();
request.responseType = "arraybuffer";
request.open("GET", url, true);
//console.log (`loadImpulse: get ${url}`);

request.addEventListener("load", () => {
if (request.response) {
decodeBuffer(request.response, callback);
} else {
statusMessage("loadImpulse: response is null");
} // if
}); // load

request.send();
} // loadImpulse


