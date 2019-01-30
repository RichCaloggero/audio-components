import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady, addToAutomationQueue, removeFromAutomationQueue} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";


let instanceCount  = 0;


class AudioControl extends _AudioContext_ {
static get template () {
return html`
<slot></slot>
`; // html
} // get template
static get is() { return "audio-control"; }

static get properties () {
return {
nme: String, function: String
};
} // properties

static get observers () {
return [
"updateParameter(name, function)"
];
} // observers

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioControl.is}-${instanceCount}`;
this.ui = false;
this.component = new AudioComponent (this.audio, "control");
this.target = null;
this.parameters = [];
console.log (`${this.id} created`);
} // constructor


connectedCallback () {
super.connectedCallback ();
childrenReady(this)
.then(children => {
if (children.length < 2) throw new Error(`${this.id}: must have at least one target element and one parameter as children`);
this.target = children[0];
const targetComponent = this.target.component;
this.component.input.connect(targetComponent.input);
targetComponent.output.connect(this.component.output);
children.slice(1).forEach(child => this.updateParameter(child.name, child.function));
this.start();
signalReady(this);
}).catch(error => alert(`audio-control: cannot connect;\n${error}`));
} // connectedCallback

updateParameter (_name, _text) {
if (!_name || !_text) return;
const index = this.parameters.findIndex(p => p.name === _name);
const parameter = index >= 0? this.parameters[index]
: {name: _name, text: _text};

if (parameter.text) {
parameter.function = compileFunction(parameter.text, "t");
if (!parameter.function) throw new Error(`${this.id}: automation of parameter ${parameter.name} failed; invalid function;\n${parameter.text}`);
parameter.function.bind(this.target);
} else {
parameter.function = null;
} // if

if (index >= 0) this.parameters[index] = parameter;
else this.parameters.push(parameter);
} // updateParameter


automate () {
this.parameters.forEach(parameter => {
const target = this.target;
const p = target[parameter.name];
const value = parameter.function(this.audio.currentTime);

if (p instanceof AudioParam) p.value = value;
else target[parameter.name] = value;
}); // forEach parameters
} // automate

start () {
addToAutomationQueue (this);
} // start

stop () {
removeFromAutomationQueue(this);
} // stop
} // class AudioControl
customElements.define(AudioControl.is, AudioControl);


function compileFunction (text, parameter) {
try {
return new Function (parameter,
`with (Math) {return ${text};}`);

} catch (e) {
alert (e);
return null;
} // try
} // compileFunction
