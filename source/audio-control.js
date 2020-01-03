import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady, addToAutomationQueue, removeFromAutomationQueue, automationInterval, statusMessage} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";


let instanceCount  = 0;
const userScope = Object.create(null);


class AudioControl extends _AudioContext_ {
static get template () {
return html`
<div class="audio-control">
</div>
<slot></slot>
`; // html
} // get template
static get is() { return "audio-control"; }

static get properties () {
return {
};
} // properties

static get observers () {
return [
//"updateParameter(name, function)"
];
} // observers

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioControl.is}-${instanceCount}`;
this._init = false;
this.target = null;
this.parameters = [];
} // constructor


connectedCallback () {
super.connectedCallback ();
childrenReady(this)
.then(children => {
if (children.length < 2) throw new Error(`${this.id}: need two or more children`);
this.component = new AudioComponent(this.audio, "control", this);
this.target = children[0];

const targetComponent = this.target.component;
this.component.input.connect(targetComponent.input);
targetComponent.output.connect(this.component.wet);

const targetNode = targetComponent.node;
if (targetNode) {
children.slice(1)
.filter(p => {
return !p.function && p.name in targetNode;
}).forEach(p => {
const param = targetNode[p.name];
const automator = p.children[0].component;
if (param && param instanceof AudioParam) {
automator.output.connect(param);
console.debug(`${this.id}: connected ${p.children[0].id} to ${p.name} of ${this.target.id}`);

}else {
throw new Error(`${this.id}: ${p.name} parameter of ${target.id} is not an AudioParam`);
} // if
}); // forEach
console.debug("-- connected");

} else {
console.debug(`${this.id}: no target node`);
} // if targetNode

this.start();
signalReady(this);

}).catch(error => alert(`audio-control: cannot connect;\n${error}`));
} // connectedCallback


automate (_stop) {
const target = this.target;
this.parameters.forEach(parameter => {
const p = target[parameter.name];
try {
if (parameter.function) {
const value = parameter.function(this.audio.currentTime);

if (p instanceof AudioParam) {
//p.value = value;
//p.linearRampToValueAtTime(value, audio.currentTime);
p.exponentialRampToValueAtTime(value, automationInterval);
//p.setValueAtTime(value, audio.currentTime);
} else {
target[parameter.name] = value;
} // if
} // if

} catch (e) {
statusMessage (e);
parameter.function = null;
} // try
}); // forEach parameters
//console.debug (`automate: automating ${this.target.id}`);


} // automate

start () {
addToAutomationQueue (this);
} // start

stop () {
removeFromAutomationQueue(this);
} // stop
} // class AudioControl

customElements.define(AudioControl.is, AudioControl);


export function compileFunction (text, parameter = "t") {
try {
return new Function (parameter,
`with (Math) {
function  toRange (x, a,b) {return (Math.abs(a-b) * (x+1)/2) + a;}
function s (x, l=-1.0, u=1.0) {return toRange(Math.sin(x), l,u);}
function c (x, l=-1.0, u=1.0) {return toRange(Math.cos(x), l,u);}
return ${text};
} // Math
`); // new Function

} catch (e) {
alert (e);
return null;
} // try
} // compileFunction

export function updateParameter (controller, _name, _text, _type) {
//console.debug(`${controller.id}.updateParameter: ${_name} ${_text}`);
if (!_name ) return;
const parameters = controller.parameters;
const index = parameters.findIndex(p => p.name === _name);
const parameter = index >= 0? parameters[index] : {};
parameter.name = _name;
parameter.text = _text;
parameter.type = _type;


if (parameter.text) {
parameter.function = compileFunction(parameter.text, "t");

if (parameter.function) {
parameter.function.bind(controller.target);
controller._init = true;
} else {
statusMessage(`automation of parameter ${parameter.name} failed; invalid function;\n${parameter.text}`);
} // if

} else {
parameter.function = null;
if (controller._init) statusMessage(`Automation disabled for ${parameter.name}`);
} // if

if (index < 0) parameters.push(parameter);
//console.debug(`- updated ${index} ${parameter.toSource()}`);
} // updateParameter

