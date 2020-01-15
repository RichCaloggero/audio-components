// bufferToWave: https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/

import {bufferToWave} from "./bufferToWave.js";
import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";

let audioPlayer;
export function registerAudioPlayer (x) {if (x) audioPlayer = x; return audioPlayer;}

// audio-context
let instanceCount = 0;
export let shadowRoot = null;
export let audio;
export let automationInterval = 0.070; // seconds
let automationQueue = [];
let automator = null;
let _automation = false;


/* the following maintains a map of elements and method calls on their underlying components.
signalReady() runs these each time an element becomes ready.
Only used for methods common to all elements like mix() and bypass() which need to be called when the subclass component is ready.
for methods defined in the subclass, call the method in connectedCallback() for that element.
this avoids having to call methods common to all elements in the subclass.
*/

const iMap = new Map();
function doIfInitialized(element, method, value) {
if (element.component) {
element.component[method](value);
return;
} // if

const queue = iMap.has(element)? iMap.get(element) : [];
queue.push({method: method, value: value});
iMap.set(element, queue);
//console.debug(`defering ${element.id}.${method}...`);
} // doIfInitialized

export class _AudioContext_ extends PolymerElement {
static get template () {
return html`
<fieldset class="audio-context">
<legend><h1>[[label]]</h1></legend>
<ui-boolean label="enable automation" value="{{enableAutomation}}" shortcut="alt shift a"></ui-boolean>
<ui-number label="automationInterval" value="{{automationInterval}}" min="0.01" max="3.0" step="0.01"></ui-number>
<ui-boolean label="enable analyser" value="{{enableAnalyser}}" shortcut="alt shift x"></ui-boolean>


<ui-boolean label="showListener" value="{{showListener}}"></ui-boolean>
<ui-boolean label="enable record mode" class="enable-record-mode" value="{{recordMode}}"></ui-boolean>

<fieldset class="recorder" hidden>
<legend><h2>Recorder</h2></legend>

<div id="results-label">Results - right click and choose save from the context menu:</div>
<audio controls tabindex="0" aria-labelledby="results-label"></audio>
</fieldset>

<fieldset hidden id="listener">
<legend><h3>Listener</h3></legend>
<ui-number label="x" value="{{listenerX}}"></ui-number>
<ui-number label="y" value="{{listenerY}}"></ui-number>
<ui-number label="z" value="{{listenerZ}}"></ui-number>

<ui-number label="forwardX" value="{{forwardX}}"></ui-number>
<ui-number label="forwardY" value="{{forwardY}}"></ui-number>
<ui-number label="forwardZ" value="{{forwardZ}}"></ui-number>

<ui-number label="upX" value="{{upX}}"></ui-number>
<ui-number label="upY" value="{{upY}}"></ui-number>
<ui-number label="upZ" value="{{upZ}}"></ui-number>
</fieldset>

<!--<div role="dialog" hidden id="defineKeyDialog" aria-labelledby="defineKeyDialog-title">
<header>
<h2 id="defineKeyDialog-title">Define Key</h2>
<button class="close">Close</button>
</header>

<div class="body">
<label>Control <input type="checkbox" class="control"></label>
<label>Alt <input type="checkbox" class="alt"></label>
<label>Shift <input type="checkbox" class="shift"></label>
<label>key <input type="text" class="key"></label>
<button class="ok">OK</button>
</div><!-- .body -->
</div><!-- dialog -->
-->

<div role="region" aria-label="status" id="statusMessage" aria-live="polite"></div>
</fieldset><!-- audio context region -->

<slot></slot>
`; // html
} // get template

static get is() { return "audio-context";}

static get properties() {
return {
id: String,
hide: String,
label: String,
sampleRate: Number,
depth: {type: Number, notify:true, value: 0},
container: {type: Boolean, notify:true, value: false},

mix: {type: Number, notify: true, observer: "_mix"},
bypass: {type: Boolean, notify: true, observer: "_bypass"},
"silent-bypass": {type: Boolean, notify: true, observer: "_silentBypass"},
enableAutomation: {type: Boolean, value: false, notify: true, observer: "_enableAutomation"}, // enableAutomation
enableAnalyser: {type: Boolean, value: false, notify: true, observer: "_enableAnalyser"},
showListener: {type: Boolean, value: false, notify: true, observer: "_showListener"},
recordMode: {type: Boolean, value: false, notify: true, observer: "_recordMode"},
shortcuts: {type: String, notify:true, observer: "shortcutsChanged"},
automationInterval: {type: Number, value: 0.05, notify: true, observer: "automationIntervalChanged"},

listenerX: {type: Number, value: 0, notify: true, observer: "listenerXChanged"},
listenerY: {type: Number, value: 0, notify: true, observer: "listenerYChanged"},
listenerZ: {type: Number, value: 0, notify: true, observer: "listenerZChanged"},

forwardX: {type: Number, value: 0, notify: true, observer: "forwardXChanged"},
forwardY: {type: Number, value: 0, notify: true, observer: "forwardYChanged"},
forwardZ: {type: Number, value: 0, notify: true, observer: "forwardZChanged"},

upX: {type: Number, value: 0, notify: true, observer: "upXChanged"},
upY: {type: Number, value: 0, notify: true, observer: "upYChanged"},
upZ: {type: Number, value: 0, notify: true, observer: "upZChanged"},
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${_AudioContext_.is}-${instanceCount}`;
this._ready = false;
this.ui = true;

if (! window.AudioContext) {
alert ("webaudio not available");
return;
} // if

if (!audio) {
audio = new AudioContext({sampleRate: 88200});
//console.debug(`${this.id}: creating new audio context`);
} // if

this.audio = audio;
this.analyser = null;
} // constructor


connectedCallback () {
super.connectedCallback();
// if is element with a UI, then hide it if no label or name attribute present in HTML
// hide controls in UI elements that have label or name if control's label or name mentioned in hide attribute's value
this.hideControls();

// when this.shadowRoot becomes set for the first time, store it since it will be shadow root of the audio-context itself
if (!shadowRoot) shadowRoot = this.shadowRoot;

if (this.matches("audio-context")) {
//console.debug(`connected: ${this.id}, ${this.container}`);
childrenReady(this).then (children => {
enumerateNonUi(this)
.forEach(e => e.depth = depth(e));
signalReady(this);
}).catch (error => statusMessage(error)); ;
} // if
} // connectedCallback


automationIntervalChanged (value) {if (value && !Number.isNaN(value)) automationInterval = value;}
 
listenerXChanged (value) {this.audio.listener.setPosition(this.listenerX, this.listenerY, this.listenerZ);}
listenerYChanged (value) {this.audio.listener.setPosition(this.listenerX, this.listenerY, this.listenerZ);}
listenerZChanged (value) {this.audio.listener.setPosition(this.listenerX, this.listenerY, this.listenerZ);}

forwardXChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}
forwardYChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}
forwardZChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}

upXChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}
upYChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}
upZChanged (value) {this.audio.listener.setOrientation(this.forwardX, this.forwardY, this.forwardZ, this.upX, this.upY, this.upZ);}

shortcutsChanged (value) {
const root = this.shadowRoot;
if (! root) return;

const parameters = Array.from(root.querySelectorAll("ui-number, ui-boolean, ui-text, ui-list"));
//console.debug(`- ${parameters.length} parameters found`);
const shortcuts = parseShortcuts(value);
//console.debug(`- ${shortcuts.length} shortcuts found`);

parameters.forEach(p => {
const name = p.name || p.label;
if (name) {
const shortcut = shortcuts.find(x => x.parameter.toLowerCase() === name.toLowerCase());
if (shortcut) {
//console.debug(`- defining shortcut for ${name} to be ${shortcut.shortcut}`);
p.shortcut = shortcut.shortcut;
} // if
} // if
}); // forEach
} // shortcutsChanged

hideControls () {
const label = this.label?
this.label.trim() : "";
const hide = this.hide?
this.hide.trim().split(",").map(x => x.trim().toLowerCase())
: [];

if (!label) {
// hide everything if no label
this.uiControls().forEach(element => element.hidden = true);
if (this.shadowRoot) this.shadowRoot.children[0].hidden = true;

} else {
// hide only those elements whose label or name listed in hide attribute
this.uiControls().filter(x => x.name || x.label).forEach(element => {
const name = (element.name || element.label).trim().toLowerCase();
//console.debug(`- checking ${element.id} ${name}`);

if (name && hide.includes(name)) element.hidden = true;
}); // forEach
} // if
} // hideControls

uiControls () {
const selectors = "ui-list,ui-text,ui-number,ui-boolean";
const controls = Array.from(this.shadowRoot.querySelectorAll(selectors));
//console.debug(`${this.id}: controls ${controls.length} ${controls.map(x => x.name || x.label || x.id || x)}`);
return controls;
} // uiControls


_mix (value) {doIfInitialized(this, "mix", value);}
_bypass (value) {doIfInitialized(this, "bypass", value);}
_silentBypass (value) {doIfInitialized(this, "silentBypass", value);}

components (elements) {
return elements.map(e => {
if (e && e.component) return e.component;
else throw new Error(`${this.id}: ${e} is null or invalid -- cannot connect`);
});
} // components

_enableAutomation (value) {
if (value) {
startAutomation();
this.dispatchEvent(new CustomEvent("startAutomation", {detail: {interval: automationInterval}}));
} else {
stopAutomation();
this.dispatchEvent(new CustomEvent("stopAutomation"));
} // if
} // _enableAutomation

_enableAnalyser (value) {
if (audioPlayer) {
if (value) {
this.analyser = new Analyser(audio);
audioPlayer.output.connect(this.analyser);
} else {
this.analyser = null;
} // if
} // if
} // _enableAnalyser

_showListener (value) {if (shadowRoot) shadowRoot.querySelector("#listener").hidden = !value;}

_recordMode (value) {
if (shadowRoot) {
if (value) {
shadowRoot.querySelector(".recorder").removeAttribute("hidden");
this.loadAudio(audioPlayer.src);
} else {
shadowRoot.querySelector(".recorder").setAttribute("hidden", "");
} // if
} // if
} // _recordMode

loadAudio (url) {
statusMessage("Loading...");
fetch(url)
.then(response=> {
if (response.ok) return response.arrayBuffer();
else throw new Error(response.statusText);
 }).then(data => {
const audioContext = new AudioContext();
return audioContext.decodeAudioData(data)
}).then(buffer => {
this.render(buffer);
statusMessage(`${round(buffer.duration/60)} minutes of audio loaded.`);
}).catch(error => statusMessage(error));
} // loadAudio

render (buffer) {
const _audio = audio;
const _audioPlayer = audioPlayer;
const recorder = this.shadowRoot.querySelector(".recorder");
const audioElement = recorder.querySelector("audio");
const automationEnabled = this.enableAutomation;

audio = new OfflineAudioContext(2, buffer.length, 44100);
const html = this.outerHTML;
let container = document.createElement("div");
container.setAttribute("hidden", "");
container.innerHTML = html;
this.parentElement.appendChild(container);
const newContext = container.children[0];
const statusMessage = (text) => this.shadowRoot.querySelector("#statusMessage").textContent = text;


newContext.addEventListener("elementReady", () => {
//setTimeout(() => {
const audioSource = audio.createBufferSource();
audioSource.buffer = buffer;
audioPlayer.audioSource = audioSource;
audioSource.connect(audioPlayer.output);


if (automationEnabled) {
newContext.enableAutomation = true;
//startAutomation();
newContext._enableAutomation(true);
console.debug(`recording: automation enabled for ${automationQueue.length} elements...`);
} // if
copyAllValues(this, newContext);

audioSource.start();
statusMessage("Rendering audio, please wait...");

audio.startRendering()
.then(buffer => {
recorder.removeAttribute("hidden");
audioElement.src = URL.createObjectURL(bufferToWave(buffer, buffer.length));
audioElement.focus();

// restoring...
audio = _audio;
audioPlayer = _audioPlayer;
audioPlayer.audioSource.connect(audioPlayer.output);
this.parentElement.removeChild(container);
container.innerHTML = "";
container = null;
this.enableAutomation = automationEnabled;

statusMessage(`Render complete: ${Math.round(10*buffer.duration/60)/10} minutes of audio rendered.`);
}).catch(error => statusMessage(`render: ${error}\n${error.stack}\n`));
}); // newContext ready
//}, 3000);
} // render

setId (value) {this.id = value;}
} // class _AudioContext_

customElements.define(_AudioContext_.is, _AudioContext_);


/// utility functions


export function _setParam (parameter, value) {
//console.debug (`_setParameterValue (${parameter}, ${value}`);
if (! parameter) return;

try {
if (parameter instanceof AudioParam) {
if (automator) parameter.linearRampToValueAtTime(value, audio.currentTime);
else parameter.value = value;

} else {
parameter = value;
} // if

return parameter;

} catch (e) {
let message = `_setParam (${parameter}, ${value}): ${e}`;
alert(`${message}\n${e.stack}`);
} // catch
} // _setParam

export function childrenReady (element) {
//console.debug(`childrenReady: ${element.id}`);
const children = Array.from(element.children);
if (!children || children.length === 0) {
//console.debug(`- childrenReady: recursion bottomed out at ${element.id}`);
return (ready(element));
} // if
const undefinedDescendants = Array.from(element.querySelectorAll(":not(:defined)"));
//console.debug(`- ${undefinedDescendants.length} undefined descendants`);

return new Promise((resolve, reject) => {
Promise.all(undefinedDescendants.map(e => customElements.whenDefined(e.localName)))
.then(x => {
//const undefinedChildren = children.filter(e => e.matches(":not(:defined)"));
//console.debug(`childrenReady: ${element} has ${undefinedChildren.length} undefined children`);

console.log(`
${element.id}: waiting for ${children.length} children
- ${children.map(e => e.nodeName.toLowerCase())}
`);
resolve(Promise.all(children.map(child => ready(child))));
}); // Promise.all.then
}); // new Promise
} // childrenReady

function ready (element) {
if (element && element instanceof _AudioContext_) {
if (element._ready) {
console.log(`${element.id} is ready (via flag).`);
return element;
} // if

//console.debug(`ready: waiting for ${element.id}`);
return new Promise ((resolve, reject) => {
element.addEventListener("elementReady", e => {
console.log(`${e.target.id} is ready (via event).`);
resolve(e.target);
});
});

} else {
throw new Error (`ready: ${element.id} is invalid`);
} // if
} // ready

export function signalReady (element) {
if (element && element instanceof _AudioContext_) {
element._ready = true;
element.dispatchEvent(new CustomEvent("elementReady"));
//console.debug(`signalReady dispatched on ${element.id}`);

if (iMap.has(element)) {
iMap.get(element)
.forEach(item => element.component[item.method](item.value));
iMap.delete(element);
} // if

} else {
console.log(`signalReady: ${element} invalid`);
return;
} // if
} // signalReady

export function startAutomation () {automator = setInterval(() => automationQueue.forEach(e => e.automate()), 1000*automationInterval);} // startAutomation
export function stopAutomation () {clearInterval(automator); automator = null;}

/*export function startAutomation () {
_automation = true;
const _tick = () => {
automationQueue.forEach(e => e.automate());
if (_automation) {
automator = audio.createOscillator();
automator.onended = _tick;
automator.start();
automator.stop(automationInterval/1000);
} // if
}; // _tick

_tick();
} // startAutomation

export function stopAutomation () {
_automation = false;
} // stopAutomation
*/


export function addToAutomationQueue (element) {
automationQueue.push (element);
console.debug(`added ${element.label || element.id} to automation queue`);
} // addToAutomationQueue

export function removeFromAutomationQueue (element) {
automationQueue = automationQueue.filter(e => e != element);
} // removeFromAutomationQueue


export function statusMessage (message, log) {
const p = document.createElement("p");
p.appendChild(document.createTextNode(message));
if (shadowRoot) {
const status = shadowRoot.querySelector ("#statusMessage");

if (status) {
if (!log) status.innerHTML = "";
status.appendChild(p);
return;
} // if
} // if

alert (message);
} // statusMessage

function parseShortcuts (text) {
//console.debug(`parseShortcuts:  ${text}`);
return text.split(",").map(definition => {
//console.debug(`- definition: ${definition}`);
const tokens = definition.match(/(\w)+/g);
if (tokens.length < 2) throw new Error(`${definition}: invalid shortcut definition`);
return {parameter: tokens[0], shortcut: tokens.slice(1).join(" ")};
});
} // parseShortcuts

function copyAllValues (_from, _to) {
//try {
_from = findAllControls(_from);
_to = findAllControls(_to);

const values = _from.map(x => {
return x.type && x.type === "checkbox"? x.checked : x.value
});

_to.forEach((x,i) => {
if (x instanceof HTMLInputElement && x.type=== "checkbox") {
x.checked = Boolean(values[i]);
//console.debug("- checkbox: ", x);
x.dispatchEvent(new Event("click"));
} else {
x.value = values[i];
x.dispatchEvent(new Event("change"));
} // if
});
} // copyAllValues

function findAllControls(root) {
const enableRecordMode = document.querySelector("audio-context")
.shadowRoot.querySelector(".enable-record-mode")
.shadowRoot.querySelector("input");
return enumerateAll(root).filter(x => 
x && x.matches && x.matches("input,select") && x !== enableRecordMode
); // filter
} // findAllControls


function enumerateAll (root) {
return [
root,
Array.from(root.children).map(x => enumerateAll(x)),
root.shadowRoot? enumerateAll(root.shadowRoot) : []
].flat(Infinity);
} // enumerateAll

function enumerateNonUi (root) {
return enumerateAll(root)
.filter(x => x instanceof _AudioContext_);
} // enumerateNonUi

function round (n) {return Math.round(n*10)/10;}

export function depth (start, top = _AudioContext_) {
let e = start;
//while (e && !e.matches("audio-context")) e = e.parentElement;

let _depth = 1;
while (e && !e.matches("audio-context")) {
if (!e.container || e.label) _depth += 1;
e = e.parentElement;
} // while

return _depth;
} // depth
