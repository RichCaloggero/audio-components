import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount  = 0;

class AudioConvolver extends _AudioContext_ {
static get template () {
return html`

<div class="audio-convolver" role="region" aria-label$="{{label}}">
<span class="label">[[label]]</span>

<ui-boolean name="bypass" label="bypass" value="{{bypass}}"></ui-boolean>

<ui-list name="impulseUrl" label="impulse" value="{{impulseUrl}}" values="{{impulses}}"></ui-list>
</div>
`; // html
} // get template

static get is() { return "audio-convolver"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

impulseLibrary: {
type: String,
value: ""
}, // impulseLibrary

impulses: {
type: String,
value: ""
}, // impulses

impulseUrl: {
type: String,
value: "",
notify: true,
observer: "impulseUrlChanged"
}, // impulseUrl

defaultExtension: {
type: String,
value: ""
}, // defaultExtension

bypass: {
type: Boolean,
value: false,
notify: true,
observer: "_bypass"
}, // bypass

invertPhase: {
type: Boolean,
value: false,
notify: true,
observer: "_invertPhase"
} // invertPhase

}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = AudioConvolver.is + instanceCount;

this._init (audio.createConvolver());
//this._audioIn.channelCount = this._in.channelCount = this._audioOut.channelCount = this._out.channelCount = this._audioNode.channelCount = 2;
//this._audioIn.channelCountMode = this._in.channelCountMode = this._audioOut.channelCountMode = this._out.channelCountMode = this._audioNode.channelCountMode = "explicit";
} // constructor


connectedCallback () {
super.connectedCallback ();
//if (this.contextCheck(AudioConvolver.is)) {
this.addFieldLabels ();
//moveElements (this.shadowRoot.querySelector(".impulseNames").assignedNodes(), this.shadowRoot.querySelector (".impulse"));
//this.shadowRoot.querySelector (".impulse").dispatchEvent (new CustomEvent("change"));
//} // if
} // connectedCallback

impulseChanged (value) {
} // impulseChanged

impulseUrlChanged (value) {
if (value) {
loadImpulse (this.impulseLibrary + "/" + value + this.defaultExtension, (buffer) => {
this._audioNode.buffer = buffer;
}); // load
} // if
} // impulseUrlChanged


} // class AudioConvolver


function decodeBuffer(arrayBuffer, callback) {
audio.decodeAudioData(arrayBuffer, function (audioBuffer) {
if (typeof callback === "function" && audioBuffer !== null) {
callback(audioBuffer);
} else {
throw new Error ("loadImpulse: missing callback");
} // if
}, function (e) {
throw new Error(`Could not decode audio data: ${e}`);
}); // decode
} // decodeBuffer

function loadImpulse (url, callback) {
var request = new XMLHttpRequest();
request.responseType = "arraybuffer";
request.open("GET", url, true);
//console.log (`loadImpulse: get ${url}`);

request.addEventListener("load", function () {

if (request.response) {
decodeBuffer(request.response, callback);
} else {
throw new Error ("loadImpulse: response is null");
} // if
//} // if
//}; // onreadstatechange
}); // load
request.send();
} // loadImpulse

function moveElements (source, destination) {
source.filter (x => x.nodeType === 1)
.forEach (e => destination.appendChild(e));
} // moveElements

window.customElements.define(AudioConvolver.is, AudioConvolver);
