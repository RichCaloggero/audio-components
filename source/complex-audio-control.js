import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;
let automationQueue = [];

window.AudioControl = class AudioControl extends _AudioContext_ {
static get template () {
return html`
<div class="audio-control">
<label>automating {{parameter}} as
<br><input type="text" value="{{value::change}}">
</label>
</div>
`; // html
} // get template
static get is() { return "audio-control"; }

static get properties () {
return {
parameter: {
type: String,
value: "",
notify: true,
observer: "parameterChanged"
}, // parameter

value: {
type: String,
value: "",
notify: true,
observer: "valueChanged"
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioControl.is + instanceCount;
this._automation = null;
this.label = `controling ${this.parameter}`;
console.log (`${this.id} created`);
} // constructor

_attachDom(dom) {
this.shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
console.log (`${this._id} connected to ${this.parentElement.localName}`);
this.addFieldLabels ();
} // connectedCallback

setupAutomation() {
if (! this.value) return;
let element = this.parentElement;
console.log (`setting up automation for ${element._id}`);

if (this.parameter in element) {
let f = this.compileFunction (this.value, "t").bind(element);

if (f) {
console.log (`function: ${f}`);
this._automator = f;
this._automationTarget = element;
addToAutomationQueue (this);
this.start ();

} else {
alert ("invalid function: " + this.value);
} // if

} else {
alert (`parameter ${this.parameter} not in ${element.localName}`);
} // if
} // setupAutomation

start () {
let self = this;
let resolution = (this.resolution || .01); // milliseconds
let count = 100;

if (this.parameter in this._automationTarget._audioNode) {
this._audioParam = this._automationTarget._audioNode[this.parameter];
this.automation = true;
_tick ();
console.log (`${this._id}: starting automation for parameter ${this.parameter} of ${this._automationTarget._id} using resolution ${resolution}`);

} else {
alert (`parameter ${this.parameter} not in ${this._automationTarget._id}`);
} // if

function _tick () {
if (self.automation) {
scheduleParameterChanges (self._audioParam, resolution, count, self._automator);
setTimeout (_tick, 1000 * resolution * count);

} else {
self.stop ();
} // if

function scheduleParameterChanges (parameter, resolution, count, automator) {
let t = audio.currentTime;
for (let i=0; i<count; i++) {
t += resolution;
try {
parameter.setValueAtTime (automator(t), t);
} catch (e) {
alert (`scheduleParameterChanges: ${e}`);
self.value = "";
self.stop ();
removeFromAutomationQueue (self);
return;
} // try
} // for
} // scheduleParameterChanges
} // _tick
} // start

stop () {
if (! this._automationTarget) return;

console.log (`${this._id}: stopping automation for parameter ${this.parameter} of ${this._automationTarget._id}`);
this.automation = false;

if (this._audioParam) {
this._audioParam.cancelScheduledValues (0);
console.log ("- canceled scheduled values");
} // if

if (this._tick) {
clearTimeout (this._tick);
this._tick = null;
console.log ("- cleared timeout");
} // if
} // stop


static startAllAutomation () {
automationQueue.forEach ((element) => element.start());
} // startAllAutomation

static stopAllAutomation () {
automationQueue.forEach ((element) => element.stop());
} // stopAllAutomation


parameterChanged (value) {
console.log(`parameter ${value}`);
} // parameterChanged

valueChanged (value) {
this.stop ();
this.setupAutomation ();
} // valueChanged

compileFunction (text, parameter) {
try {
return new Function (parameter,
`with (Math) {return ${text};}`);

} catch (e) {
alert (e);
return null;
} // try
} // compileFunction

} // class AudioControl

function addToAutomationQueue (element) {
automationQueue.push (element);
console.log (`added ${element.label || element._id} to automation queue`);
} // addToAutomationQueue

function removeFromAutomationQueue (element) {
let found = automationQueue.indexOf(element);
if (found >= 0) {
automationQueue.splice (found, 1);
console.log (`removed ${element.label || element._id} from automation queue`);
} // if
} // removeFromAutomationQueue

window.customElements.define(AudioControl.is, AudioControl);
