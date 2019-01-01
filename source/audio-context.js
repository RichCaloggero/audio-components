//import {AudioControl} from "./audio-control.js";
import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";

// audio-context
let instanceCount = 0;
let _root = null;
export const audio = new AudioContext();
export const childrenAvailableDelay = 20; // milliseconds

export class _AudioContext_ extends PolymerElement {
static get template () {
return html`
<div class="audio-context">
<h1>[[label]]</h1>
<div class="status" role="region" aria-label="Status" aria-live="polite"></div>
</div>

<slot></slot>
`; // html
} // get template

static get is() { return "audio-context";}

static get properties() {
return {
label: String,
enableAutomation: {
type: Boolean,
value: true,
notify: true,
observer: "_enableAutomation"
}, // enableAutomation

/*hideOnBypass: {
type: Boolean,
value: true,
notify: true,
observer: "_hideOnBypass"
}, // hideOnBypass
*/
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${_AudioContext_.is}-${instanceCount}`;
this._ready = false;

if (! window.AudioContext) {
alert ("webaudio not available");
return;
} // if

if (audio) {
//alert ("only one audio context per document");
this.audio = audio;
//console.log(`inherriting from ${this.audio}.`);
} else {
alert("initialization failure -- cannot initialize new AudioContext()");
throw new Error ("cannot initialize");
} // if
} // constructor

connectedCallback () {
super.connectedCallback();
//console.log(`${this.id} connected, shadow = ${this.shadowRoot}`);
} // connectedCallback

components (elements) {
return elements.map(e => {
if (e.component) return e.component;
else throw new Error(`${this.id}: ${e.id}.component is null or invalid -- cannot connect`);
});
} // components

_enableAutomation (value) {
if (this.constructor === _AudioContext_) {
//if (value) AudioControl.startAllAutomation ();
//else AudioControl.stopAllAutomation ();
} // if
} // _enableAutomation



_setParameterValue (parameter, value) {
//console.log (`_setParameterValue (${parameter}, ${value}`);
if (! parameter) return;

try {
if (Number.isNaN(value)) {
throw new Error ("value not a number");
} // if

if (!(parameter.setValueAtTime instanceof Function)) throw new Error ("first argument must be a valid audioParam");

parameter.setValueAtTime (value, audio.currentTime);
return parameter;

} catch (e) {
let message = `_setParameterValue (${parameter}, ${value}): ${e}`;
alert (message);
alert (e.stack);
} // catch
} // _setParameterValue


static statusMessage (message) {
var status = _root.querySelector (".audio-context .status");
var doc = status.ownerDocument;
var p = doc.createElement ("p");
var t = doc.createTextNode (message);
if (status && p && t) {
p.appendChild (t);
status.appendChild (p);
//alert ("status: " + status);

} else {
alert (message);
} // if

} // statusMessage

} // class _AudioContext_

window.customElements.define(_AudioContext_.is, _AudioContext_);

/// utility functions

export function childrenReady (element) {
//console.log(`childrenReady: ${element.id}`);
const slot = (element.shadowRoot || element).querySelector("slot");
if (! slot) {
//console.log(`- ${element.nodeName.toLowerCase()} ready`);
return ready(element);
} // if

return new Promise((resolve, reject) => {
slot.addEventListener("slotchange", function (e) {
const children = Array.from(e.target.assignedNodes())
.filter(e => e.nodeType === 1);
console.log(`${element.id}: waiting for ${children.length} children`);
console.log(`- ${children.map(e => e.nodeName.toLowerCase())}`);

if (children.length > 0) {
resolve(Promise.all(children.map(child => childrenReady(child))));
//Promise.all(children.map(child => childrenReady(child)))
//.then(children => resolve(children));
} else {
resolve(ready(element));
} // if
}); // slotchange listener
}); // promise
} // childrenReady

function ready (element) {
if (element._ready) {
console.log(`${element.id} is ready.`);
return element;
} // if

//console.log(`ready: waiting for ${element.id}`);
return new Promise ((resolve, reject) => {
element.addEventListener("elementReady", (e) => resolve(e.target));
});
} // ready

export function signalReady (element) {
element._ready = true;
element.dispatchEvent(new CustomEvent("elementReady"));
console.log(`signalReady dispatched on ${element.id}`);
} // signalReady

