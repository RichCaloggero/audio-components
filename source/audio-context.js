//import {AudioControl} from "./audio-control.js";
import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";

// audio-context
let _root = null;

export class _AudioContext_ extends AudioComponent {
static get template () {
return html`

<div class="audio-context">
<h1>{{label}}</h1>
<ui-boolean name="enableAutomation" label="enable automation" value="{{enableAutomation}}"></ui-boolean>
<!--<ui-boolean name="hideOnBypass" label="hide on bypass" value="{{hideOnBypass}}"></ui-boolean>-->

<slot></slot>

<div class="status" role="region" aria-label="Status" aria-live="polite"></div>
</div>
`; // html
} // get template

static get is() { return "audio-context"; }

static get properties() {
return {
label: {
type: String,
value: ""
}, // label

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

if (! window.AudioContext) {
alert ("webaudio not available");
return;
} // if

if (window.audio) {
//alert ("only one audio context per document");
} else {
window.audio = this.audio = new AudioContext();
} // if

} // constructor

_attachDom (dom) {
this.appendChild(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
if (!_root) _root = (this.shadowRoot || this); // .querySelector (".audio-context");
} // connectedCallback


_init (audioNode) {
console.log (`initializing ${this.constructor.is} as ${audioNode? "audio processor" : "connector"}`);
this._in = audio.createGain();
this._audioIn = audio.createGain();
this._out = audio.createGain();
this._audioOut = audio.createGain();

if (audioNode) {
this._audioNode = audioNode;
this._audioIn.connect (this._audioNode).connect (this._audioOut);
} else {
//this._audioIn.connect (this._audioOut);
} // if
this._connect ();
} // _init

_invertPhase (value ) {
if (this._audioOut && this._audioOut.gain) this._audioOut.gain.value = (value)? -1.0 : 1.0;
} // _invertPhase

_bypass (value) {
if (this._in && this._out && this._audioIn && this._audioOut) {
//console.log(`bypass ${value} on ${this.constructor.is}, ${this._in}, ${this._out}`);
if (value) {
this._disconnect ();
this._in.connect (this._out);
} else {
this._disconnect ();
this._connect ();
} // if
} // if

} // _bypass

_hideOnBypass (value) {
//this._bypass (this.bypass);
} // _hideOnBypass

_connect () {
if (this._audioIn && this._audioOut) {
if (this._in) {
this._in.connect (this._audioIn);
} // if

if (this._out) {
this._audioOut.connect (this._out);
} // if
} // if
} // _connect

_disconnect () {
if (this._audioIn && this._audioOut) {
if (this._in) {
this._in.disconnect ();
this._audioOut.disconnect ();
} // if
} // if
} // _disconnect


contextCheck (name) {
var parentName = this.parentNode.localName;
//alert ("parentName: " + parentName);
/*if (parentName !== "audio-series" && parentName !== "audio-parallel" && parentName !== "audio-split") {
alert (`${name} : element must be child of audio-parallel or audio-series to participate in audio graph`);
//throw new Error ("audio graph error");
return false;
} // if
*/

return true;
} // contextCheck

whenAllChildrenLoaded (loadedCallback) {
var children = Array.from(this.childNodes).filter ((node) => node.nodeType === 1);
var loaded = children.map ((element) => {
//alert ("element: " + element);
return customElements.whenDefined (element.localName);
}); // map

try {
Promise.all (loaded)
.then (() => {
loadedCallback.call (this, children);
}).catch ((error) => {
alert (`whenAllChildrenLoaded: ${this._id} -- a child element could not be instantiated`);
throw error;
});

} catch (e) {
alert (`whenAllChildrenLoaded outer: ${e}`);
throw (e);
} // try
} // whenAllChildrenLoaded


elementName (e) {
if (e) {
return `${e.nodeName} (${e.label || e._id || e.className || ""})`;
} else {
return "[unnamed element]";
} // if
} // elementName


_enableAutomation (value) {
if (this.constructor === _AudioContext_) {
//if (value) AudioControl.startAllAutomation ();
//else AudioControl.stopAllAutomation ();
} // if
} // _enableAutomation

_mix (value) {
if (this._audioIn && this._audioOut) {

} // if
} // _mix

createId (elementName, instanceCount) {
return `${elementName}-${instanceCount}`;
} // createId

_processValues (values) {
if (values instanceof String || typeof(values) === "string") {
values = values.trim();
if (values.charAt(0) !== "[" && values.includes(",") && !values.includes('"')) {
values = values.split(",")
.map (value => value.trim());
} else {
try {values = JSON.parse(values);
} catch (e) {values = []} // catch
} // if
} // if

if (values && (values instanceof Array)) {
values = values.map (value => {
if (typeof(value) !== "object") value = {value: value, text: value};
if (value instanceof Array) value = {
value: values[0], text: value.length > 1? value[1] : value[0]
};
return value;
});
} // if

return values;
} // processValues

_handleSlotChange (e) {
let children = e.target.assignedNodes({flatten:true})
.filter(e => e.nodeType===1 && e.localName !== "dom-repeat");

if (children.length > 0) {
setTimeout (() => {
/*console.log (`slotChange: ${this.localName} ${children.length}
${children.map(e => {
let _in = e._in, _out = e._out;
return [e.localName,_in? _in.localName : "null", _out? _out.localName : "null"];
}) // map
}`);
*/

this.dispatchEvent (new CustomEvent("change", {composed: true, bubbles: true, detail: children}));
this.connectAll (children);
}, 0);
} // if
} // _handleSlotChange

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


/*nameChanged (value) {
this.name = value;
} // nameChanged
*/

} // class _AudioContext_

window.customElements.define(_AudioContext_.is, _AudioContext_);
