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
this.id = `${this.is}-${instanceCount}`;

this._automation = null;
this.label = `controling ${this.parameter}`;
console.log (`${this.id} created`);
} // constructor


connectedCallback () {
super.connectedCallback ();
console.log (`${this.id} connected to ${this.parentElement.localName}`);
} // connectedCallback

setupAutomation() {
if (!this.value) return;
let element = this.parentElement;
console.log (`setting up automation for ${element.id}`);

if (this.parameter in element) {
this._automationInterval = this.interval || 100; // milliseconds
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
this.stop ();
this._automation = setInterval (() => {
try {
this._automationTarget[this.parameter] = this._automator(audio.currentTime);
} catch (e) {
alert (e);
this.value = "";
this.stop ();
removeFromAutomationQueue (this);
} // catch
}, this._automationInterval);

console.log (`${this.id}: starting automation for parameter ${this.parameter} of ${this._automationTarget.localName} using interval ${this._automationInterval}`);
} // start

stop () {
if (this._automation) {
clearInterval (this._automation);
console.log (`${this._id}: stopping automation for parameter ${this.parameter} of ${this._automationTarget.localName} using interval ${this._automationInterval}`);
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
automationQueue = automationQueue.filter(e => e != element);
} // removeFromAutomationQueue

window.customElements.define(AudioControl.is, AudioControl);
