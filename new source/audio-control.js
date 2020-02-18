import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, childrenReady, addToAutomationQueue, removeFromAutomationQueue, automationInterval, statusMessage} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
let debugCount = 10;


let instanceCount  = 0;
const userScope = Object.create(null);


const module = class AudioControl extends _AudioContext_ {
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


constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.container = true;
this._init = false;
this.target = null;
this.parameters = [];
} // constructor

connectedCallback () {
super.connectedCallback ();
childrenReady(this, children => {
if (children.length < 2) throw new Error(`${this.id}: need two or more children`);
this.component = new AudioComponent(this.audio, "control", this);
// first child is target (element we're controlling); remaining children are audio-parameter definitions
this.target = children[0];
console.debug(`${this.id}: target ${this.target.id}`);

// connect through target element's component
const targetComponent = this.target.component;
this.component.input.connect(targetComponent.input);
targetComponent.output.connect(this.component.wet);

// if it has a node property, then we can manipulate AudioParam objects on that node directly
const targetNode = targetComponent.node;
if (targetNode) {
// filter parameter defs on whether name attribute present on target node
children.slice(1).filter(p => {
return !p.function && p.name in targetNode;
}).forEach(p => {
// audioParam we want to manipulate
const param = targetNode[p.name];
// the component generating the signal to send to the audioParam
const automator = p.children[0].component;

if (automator && automator instanceof AudioComponent && param && param instanceof AudioParam) {
automator.output.connect(param);
console.log (`${this.id}: connected ${p.children[0].id} to audioParam ${p.name} of ${this.target.id}`);

}else {
throw new Error(`${this.id}: ${p.name} parameter of ${target.id} is not an AudioParam`);
} // if
}); // forEach

} else {
console.debug(`${this.id} "${this.label}": no target node`);
} // if targetNode

// start js-based automation for this element
// (this starts even if no suitable parameter definitions present; should only start if needed)
this.start();
console.debug(`${this.id} added to automation queue`);

});
} // connectedCallback


automate () {
if (!this._ready) return;
//if (debugCount <= 0) return;
//debugCount -= 1;

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
console.debug(`parameter ${this.target.id}.${parameter.name} = ${value} at time ${this.audio.currentTime}`);
} // if

} // if

} catch (e) {
statusMessage (e);
parameter.function = null;
} // try
}); // forEach parameters
} // automate

start () {
addToAutomationQueue (this);
} // start

stop () {
removeFromAutomationQueue(this);
} // stop

updateParameter (_name, _text, _type) {
console.debug(`${controller.id}.updateParameter: ${_name} ${_text}`);
if (!_name ) return;
const parameters = this.parameters;
console.debug("- parameters: ", parameters);
const index = parameters.findIndex(p => p.name === _name);
const parameter = index >= 0? parameters[index] : {};
parameter.name = _name;
parameter.text = _text;
parameter.type = _type;
console.debug("- parameter: ", parameter);


if (parameter.text) {
parameter.function = compileFunction(parameter.text, "t");

if (parameter.function) {
parameter.function.bind(controller.target);
controller._init = true;
console.debug("- function: ", parameter.function);
} else {
statusMessage(`automation of parameter ${parameter.name} failed; invalid function;\n${parameter.text}`);
console.debug("- invalid function");
} // if

} else {
parameter.function = null;
if (controller._init) statusMessage(`Automation disabled for ${parameter.name}`);
} // if

if (index < 0) parameters.push(parameter);
console.debug("- - updated ", index, parameter);
} // updateParameter

} // class AudioControl

customElements.define(module.is, module);


export function compileFunction (text, parameter = "t") {
try {
return new Function (parameter,
`with (Math) {
function  toRange (x, a,b) {return (Math.abs(a-b) * (x+1)/2) + a;}
function s (x, l=-1.0, u=1.0) {return toRange(Math.sin(x), l,u);}
function c (x, l=-1.0, u=1.0) {return toRange(Math.cos(x), l,u);}
function r(a=0, b=1) {return toRange(Math.random(), a, b);}
return ${text};
} // Math
`); // new Function

} catch (e) {
alert (e);
return null;
} // try
} // compileFunction


