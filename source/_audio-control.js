import {_AudioContext_} from "./audio-context.js";
import {PolymerElement, html} from "@polymer/polymer/polymer-element.js";


// audio-control

let instanceCount  = 0;
let automationQueue = [];

export class AudioControl extends _AudioContext_ {
static get template () {
return html`
<style>
.panel {display:none;}
</style>

<div class="audio-control" role="region" aria-label$="[[label]]">
<span class="label">[[label]]</span>

<ui-boolean name="clickToStart" label="click to start" value="{{clickToStart}}"></ui-boolean>
<div class="clickToStartControls">
<ui-number name="tMin" label="t min" value="{{tMin}}"></ui-number>
<ui-number name="tMax" label="t max" value="{{tMax}}"></ui-number>
<ui-number name="rate" label="rate" value="{{rate}}" min="1.0" max="1000.0"></ui-number>
<ui-boolean name="run" label="run" value="{{run}}" key="r"></ui-boolean>
</div>

<ui-list name="type" label="automation type" value="{{type}}" values="function, LFO, line, point, none"></ui-list>

<div class="panels">
<div class="function panel">
<ui-text name=:function" label="function" value="{{function}}"></ui-text>
</div>

<div class="lfo panel">
<ui-text name="wave" label="wave" value="{{wave}}"></ui-text>
<ui-number name="frequency" label="frequency" value="{{frequency}}" min="0.05" max="5.0" step="0.05"></ui-number>
<ui-number name="lfoGain" label="gain" value="{{lfoGain}}" min="-100.0" max="100.0"></ui-number>
<ui-number name="center" label="center" value="{{center}}" min="-100.0" max="100.0"></ui-number>
</div>

<div class="line panel">
<!--<ui-number name="min" label="min" value="{{min}}"></ui-number>
<ui-number name="max" label="max" value="{{max}}"></ui-number>
<ui-number name="time" label="time" value="{{time}}" min="0.0" max="3.0" step="0.05"></ui-number>
-->
</div>

<div class="point panel">
<!--<ui-number name="min" label="min" value="{{min}}" min="-1000" max="1000"></ui-number>
<ui-number name="max" label="max" value="{{max}}" min="-1000" max="1000"></ui-number>
<ui-number name="time" label="time" value="{{time}}" min="0.0" max="3.0" step="0.05"></ui-number>
-->
</div>
</div><!-- panels -->
<ui-number name="dt" label="dt" value="{{dt}}" min="0.0" max="10.0" step="0.05"></ui-number>

<ui-number name="min" label="min" value="{{min}}"></ui-number>
<ui-number name="max" label="max" value="{{max}}"></ui-number>


</div>
`; // html
} // get template


static get is() { return "audio-control"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

parameter: {
type: String,
value: "",
notify: true,
//observer: "parameterChanged"
}, // parameter

function: {
type: String,
value: "",
notify: true,
observer: "functionChanged"
}, // value

dt: {
type: Number,
value: 0.1,
notify: true,
observer: "dtChanged"
}, // dt

rate: {
type: Number,
value: 1.0,
}, // rate

tMin: {
type: Number,
value: 0.0
}, // tMin

tMax: {
type: Number,
value: 100.0
}, // tMax

wave: {
type: String,
value: "",
notify: true,
observer: "waveChanged"
}, // wave

type: {
type: String,
value: "function",
notify: true,
observer: "typeChanged"
}, // type

clickToStart: {
type: Boolean,
notify: true,
observer: "clickToStartChanged"
}, // clickToStart

run: {
type: Boolean,
notify: true,
observer: "runChanged"
}, // run

frequency: {
type: Number,
value: 1.0,
notify: true,
observer: "frequencyChanged"
}, // frequency

center: {
type: Number,
value: "0.5",
notify: true,
observer: "centerChanged"
}, // center

lfoGain: {
type: Number,
value: "0.0",
notify: true,
observer: "lfoGainChanged"
}, // lfoGain


min: {
type: Number,
value: 0.0,
}, // min

max: {
type: Number,
value: 0.0,
} // max
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = AudioControl.is + instanceCount;
this._automation = null;
this._lfoGain = audio.createGain();
this._offset = 0;
console.log (`constructor: ${this.id} created`);
} // constructor

/*_attachDom(dom) {
this.shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
} // _attachDom
*/

connectedCallback () {
super.connectedCallback ();
//console.log (`${this._id} connected to ${this.parentElement.localName}`);
this.addFieldLabels ();
this._setupAutomation ();
} // connectedCallback

_setupAutomation() {
removeFromAutomationQueue (this);
this.stop ();

let element = this.parentElement;
//console.log (`setting up automation for ${element._id}`);

if (! (this.parameter in element)) {
alert (`_setupAutomation: parameter ${this.parameter} not in ${element.localName}`);
return;
} // if
this._automationTarget = element;
this._audioParam = getAudioParam(this.parameter, this._automationTarget);

if (! this.clickToStart) this.start ();
} // _setupAutomation

start () {
this.stop ();

switch (this.type.toLowerCase()) {
case "function": this._startFunctionalAutomation (); break;
case "lfo": this._startLfoAutomation (); break;
case "line": this._startLineAutomation (); break;
case "point": this._startPointAutomation (); break;
case "none": return;
default: alert("audio-control.start: invalid type");
} // switch

addToAutomationQueue (this);
console.log (`audio-control.start: starting ${this.type} automation`);

} // start

stop () {
//console.log (`${this._id}: stopping automation for parameter ${this.parameter} of ${this._automationTarget? this._automationTarget.localName : null}`);
if (this._audioParam) {
this._audioParam.cancelScheduledValues(0);
} // if

if (this._oscillator) {
this._oscillator.stop ();
this._oscillator = null;
} // if

if (this._automation) {
clearInterval (this._automation);
this._automation = null;
} // if

if (this._automator) {
this._automator = null;
} // if
} // stop

_startFunctionalAutomation () {
if (! this.function) return;
let t = this.run? this.tMin : audio.currentTime;
let f = compileFunction (this.function, "t").bind(this._automationTarget);

if (f) {
//console.log (`function: ${f}`);
this._automator = f;

} else {
alert ("invalid function: " + this.function);
return;
} // if

this._automation = setInterval (() => {
try {
this._automationTarget[this.parameter] = this._automator(t);

if (this.run) {
t += this.dt * this.rate;
if (t > this.tMax) t = this.tMin;
} // if
} catch (e) {
alert (e);
this.stop ();
} // catch
}, 1000 * this.dt);

//console.log (`${this._id}: starting automation for parameter ${this.parameter} of ${this._automationTarget? this._automationTarget.localName : null} using interval ${this.dt}`);
} // startFunctionalAutomation

_startLfoAutomation () {
if (! this.wave) return;
if (! this._audioParam) return;

if (typeof(this._audioParam) === "string" || this._audioParam instanceof String) {
alert (`parameter ${parameter} not automatable via wave - change type to 'function' and try again`);
return;
} // if

this._wave = createWave (this.wave);
this._startOscillator ();
} // _startWaveAutomation

_startLineAutomation () {
//return;
if (! this._audioParam) return;

this._automation = setInterval (() => {
try {
this._audioParam.setTargetAtTime (random(this.min,this.max), audio.currentTime, this.time);
} catch (e) {
alert (`line automation : ${e}`);
this.stop ();
} // catch
}, 1000 * this.dt);
} // _startLineAutomation

_startPointAutomation () {
if (! this._audioParam) return;

this._automation = setInterval (() => {
try {
this._automationTarget[this.parameter] = random(this.min,this.max);
} catch (e) {
alert (`point automation : ${e}`);
this.stop ();
} // catch
}, 1000 * this.dt);
} // _startPointAutomation

static startAllAutomation () {
automationQueue.forEach ((element) => element.start());
} // startAllAutomation

static stopAllAutomation () {
automationQueue.forEach ((element) => element.stop());
} // stopAllAutomation


_startOscillator () {
let oscillator = audio.createOscillator ();
oscillator.setPeriodicWave (this._wave);
oscillator.frequency.value = this.frequency || 1.0;
this._audioParam.value = this.center;

oscillator.connect (this._lfoGain).connect (this._audioParam);
oscillator.start ();
//console.log (`- oscillator started`);

this._oscillator = oscillator;
} // _startOscillator


frequencyChanged (value) {
if (this._oscillator) this._oscillator.frequency.value = value;
} // frequencyChanged

parameterChanged (value) {
//console.log(`parameter ${value}`);
} // parameterChanged

functionChanged (value) {
this.start ();
} // functionChanged

typeChanged (value) {
value = value.toLowerCase();
let panels = this.shadowRoot.querySelector (".panels");
let panel = panels.querySelector (`.${value}`);
this.shadowRoot.querySelectorAll (".panels > .panel")
.forEach ((_panel) => {
_panel.style.display = (_panel === panel)?
"block" : "none";
}); // forEach

this.start ();
} // typeChanged

clickToStartChanged (value) {
this.shadowRoot.querySelector(".clickToStartControls").style.display = 
(value)? "block" : "none";
} // clickToStartChanged

runChanged (value) {
if (value && !Number.isNaN(value)) {
this._offset = -1 * (this.dtMin + audio.currentTime);
this.start ();
} else {
this._offset = 0;
this.stop ();
} // if
} // runChanged

waveChanged (value) {
this.start ();
} // waveChanged

lfoGainChanged (value) {
this._lfoGain.gain.value = value;
} // lfoGainChanged

centerChanged (value) {
if (this._audioParam) this._audioParam.value = value;
} // centerChanged

dtChanged (value) {
this.start ();
} // dtChanged

} // class AudioControl

function addToAutomationQueue (element) {
automationQueue.push (element);
//console.log (`added ${element.label || element._id} to automation queue`);
} // addToAutomationQueue

function removeFromAutomationQueue (element) {
let found = automationQueue.indexOf(element);
if (found >= 0) {
automationQueue.splice (found, 1);
//console.log (`removed ${element.label || element._id} from automation queue`);
} // if
} // removeFromAutomationQueue

function getAudioParam (parameter, element) {
let properties = element.constructor.properties;

return element._audioNode[properties[parameter].audioParam || parameter];
} // getAudioParam

function createWave (_wave) {
let freqs = _wave.split (",");
if (! freqs || !(freqs instanceof Array)) {
alert (`createWave: invalid value  ${_wave} - must be numbers separated by comma`);
throw ("invalid value");
} // if

let real = new Float32Array(freqs.length+1);
let imaginary = new Float32Array(freqs.length+1);

freqs.forEach ((freq,i) => {
let values = freq.trim().split(" ");
real[i] = values[0];
imaginary[i] = (values.length === 2)?
values[1] : 0.0;
}); // forEach

//console.log (`createWave: ${real} ${imaginary}`);
return audio.createPeriodicWave (real, imaginary, {disableNormalization: true});
} // createWave

function compileFunction (text, parameter) {
try {
return new Function (parameter,
`with (Math) {return ${text};}`);

} catch (e) {
alert (e);
return null;
} // try
} // compileFunction

function random (a,b) {
return Math.random() * Math.abs(a-b) + Math.min(a,b);
} // random

window.customElements.define(AudioControl.is, AudioControl);
