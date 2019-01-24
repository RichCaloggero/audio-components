import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady, addToAutomationQueue, removeFromAutomationQueue} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";


let instanceCount  = 0;


class AudioControl extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-control">
<legend><h2>[[label]]</h2></legend>
<ui-text label="automating [[parameter]] as " value="{{function}}"></ui-text>
</fieldset>

<slot></slot>
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

function: {
type: String,
value: "",
notify: true,
observer: "functionChanged"
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioControl.is}-${instanceCount}`;

this._automation = null;
this.label = `controling ${this.parameter}`;
this.component = new AudioComponent (this.audio, "control");
//console.log (`${this.id} created`);
} // constructor


connectedCallback () {
super.connectedCallback ();
childrenReady(this)
.then(children => {
const target = children[0];
const targetComponent = target.component;
this.component.input.connect(targetComponent.input);
targetComponent.output.connect(this.component.output);
this.setupAutomation(target);
signalReady(this);
}).catch(error => alert(`audio-control: cannot connect;\n${error}`));
} // connectedCallback

setupAutomation(target) {
if (!target || !this.parameter || !this.function) return;
console.log (`setting up automation for ${target.id}`);

if (this.parameter in target) {
let f = this.compileFunction (this.function, "t").bind(target);

if (f) {
console.log (`function: ${f}`);
this._automator = f;
this._automationTarget = target;
this.start();

} else {
alert ("invalid function: " + this.function);
} // if

} else {
alert (`parameter ${this.parameter} not in ${target.localName}`);
} // if
} // setupAutomation

automate () {
const parameter = this.parameter;
const target = this._automationTarget;
const value = this._automator(this.audio.currentTime);

if (parameter instanceof AudioParam) target[parameter].value = value;
else target[parameter] = value;
} // automate

start () {
addToAutomationQueue (this);
} // start

stop () {
removeFromAutomationQueue(this);
} // stop


parameterChanged (value) {
console.log(`audio-control: parameter set to ${value}`);
} // parameterChanged

functionChanged (value) {
this.setupAutomation(this._automationTarget);
console.log(`audio-control: function set to ${value}`);
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


customElements.define(AudioControl.is, AudioControl);
