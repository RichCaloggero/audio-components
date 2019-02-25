import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";

// audio-context
let instanceCount = 0;
export let shadowRoot = null;

export const audio = new AudioContext();

const automationInterval = 50; // milliseconds
let automationQueue = [];
let automation = null; // value returned from setInterval

export class _AudioContext_ extends PolymerElement {
static get template () {
return html`
<div class="audio-context">
<h1>[[label]]</h1>
<ui-boolean label="enable automation" value="{{enableAutomation}}"></ui-boolean>
<ui-boolean label="showListener" value="{{showListener}}"></ui-boolean>

<fieldset hidden id="listener">
<legend><h3>Listener</h3></legend>
<ui-number label="x" value="{{listenerX}}"></ui-number>
<ui-number label="y" value="{{listenerY}}"></ui-number>
<ui-number label="z" value="{{listenerZ}}"></ui-number>
<ui-text label="orientation" value="{{listenerOrientation}}"></ui-text>
</fieldset>

<div role="dialog" hidden id="defineKeyDialog" aria-labelledby="dialog-title">
<header>
<h2 id="dialog-title">Define Key</h2>
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

</fieldset>

<div role="region" aria-label="status" id="statusMessage" aria-live="polite"></div>
</div>

<slot></slot>
`; // html
} // get template

static get is() { return "audio-context";}

static get properties() {
return {
hide: String,
label: String,
mix: {type: Number, notify: true, observer: "_mix"},
bypass: {type: Boolean, notify: true, observer: "_bypass"},
enableAutomation: {type: Boolean, value: false, notify: true, observer: "_enableAutomation"}, // enableAutomation
showListener: {type: Boolean, value: false, notify: true, observer: "_showListener"},
id: {type: String, notify:true, observer: "setId"}	,
shortcuts: {type: String, notify:true, observer: "shortcutsChanged"},
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

if (audio) {
this.audio = audio;
} else {
alert("initialization failure -- cannot initialize new AudioContext()");
throw new Error ("cannot initialize");
} // if
} // constructor


connectedCallback () {
super.connectedCallback();
// if is element with a UI, then hide it if no label or name attribute present in HTML
this.hidden = this.ui && !this.label;

// hide controls in UI elements that have label or name if control's label or name mentioned in hidden attribute's value
this.hideControls();

// when this.shadowRoot becomes set for the first time, store it since it will be shadow root of the audio-context itself
if (!shadowRoot) shadowRoot = this.shadowRoot;
} // connectedCallback

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
//console.debug(`${this.id}: hide ${this.hide}`);
if (! this.hide) return;
const controls = this.uiControls()
.filter(x => x.name || x.label);
if (this.hide.trim() && controls.length > 0) {
const hide = this.hide.split(",").map(x => x.trim().toLowerCase());
//console.debug(`${this.id} hiding ${hide.toSource()}`);

controls.forEach(element => {
const name = element.name || element.label;
//console.debug(`- checking ${element.id} ${name}`);
if (name && hide.includes(name.trim().toLowerCase())) element.hidden = true;
}); // forEach
} // if
} // hideControls

uiControls () {
const selectors = "ui-text,ui-number,ui-boolean";
const controls = Array.from(this.shadowRoot.querySelectorAll(selectors));
//console.log(`${this.id}: controls ${controls.length} ${controls.map(x => x.name || x.label || x.id || x)}`);
return controls;
} // uiControls

_mix (value) {
//console.debug(`_mix: ${this.id} ${value}`);
if (this.component) {
this.component.mix(value);
//console.debug(`- ${value}`);
} // if
} // _mix

_bypass (value) {
//console.debug(`_bypass: ${this.id}`);
if (this.component) {
this.component.bypass(value);
//console.debug(`- ${value}`);
} // if
} // bypass

components (elements) {
return elements.map(e => {
if (e && e.component) return e.component;
else throw new Error(`${this.id}: ${e} is null or invalid -- cannot connect`);
});
} // components

_enableAutomation (value) {
const _message = value? "Automation enabled." : "Automation disabled.";
if (value) startAutomation();
else stopAutomation();
//statusMessage(_message);
} // _enableAutomation

_showListener (value) {if (shadowRoot) shadowRoot.querySelector("#listener").hidden = !value;}

setId (value) {this.id = value;}


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
} // class _AudioContext_

customElements.define(_AudioContext_.is, _AudioContext_);

/// utility functions

export function childrenReady (element) {
//console.log(`childrenReady: ${element.id}`);
const children = Array.from(element.children);
if (!children || children.length === 0) {
//console.log(`- childrenReady: recursion bottomed out at ${element.id}`);
return (ready(element));
} // if
const undefinedDescendants = Array.from(element.querySelectorAll(":not(:defined)"));
//console.log(`- ${undefinedDescendants.length} undefined descendants`);

return new Promise((resolve, reject) => {
Promise.all(undefinedDescendants.map(e => customElements.whenDefined(e.localName)))
.then(x => {
//const undefinedChildren = children.filter(e => e.matches(":not(:defined)"));
//console.log(`childrenReady: ${element} has ${undefinedChildren.length} undefined children`);

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

//console.log(`ready: waiting for ${element.id}`);
return new Promise ((resolve, reject) => {
element.addEventListener("elementReady", e => {
console.log(`${e.target.id} is ready (via event).`);
resolve(e.target);
});
});

} else {
console.log(`ready: ${element.id} is invalid`);
} // if
} // ready

export function signalReady (element) {
if (element && element instanceof _AudioContext_) {
element._ready = true;
element.dispatchEvent(new CustomEvent("elementReady"));
//console.log(`signalReady dispatched on ${element.id}`);
} else {
console.log(`signalReady: ${element} invalid`);
return;
} // if
} // signalReady

export function startAutomation () {
automation = setInterval (() => {
automationQueue.forEach(e => e.automate());
}, automationInterval);
} // startAutomation

export function stopAutomation () {
clearInterval(automation);
} // stopAutomation


export function addToAutomationQueue (element) {
automationQueue.push (element);
console.log (`added ${element.label || element.id} to automation queue`);
} // addToAutomationQueue

export function removeFromAutomationQueue (element) {
automationQueue = automationQueue.filter(e => e != element);
} // removeFromAutomationQueue


export function statusMessage (message) {
if (shadowRoot) {
const status = shadowRoot.querySelector ("#statusMessage");
if (status) {
status.innerHTML = `<p>${message}</p>`;
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

