import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
let instanceCount = 0;
let shadowRoot;
const logAppend = true;

export  const module = class TestTop extends PolymerElement {
static get is () {return "test-top";}

static get properties () {
return {
hide: {type: String, value: "bypass", observer: "hideChanged", notify: true}
}; // return
} // get properties

static get template () {
return html`
<fieldset >
<legend><h2>test-top</h2></legend>
<div id="status" aria-live="polite"></div>
</fieldset>
`;
} // get template

constructor () {
super();
instanceCount += 1;
this.id = `${module.name}-${instanceCount}`;
this.module = module;
this.name = module.name;
this._ready = false;

//report (this.id, "constructor", module.name, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();
if (!shadowRoot) shadowRoot = this.shadowRoot;

if (this.name === "TestTop") waitForChildren(this, (children) => {
statusMessage(`${this.id} ready: ${children.length} children connected`, "append");
statusMessage(`- all connections complete`);
runPropertyEffects(this);
}); // waitForChildren
} // connectedCallback

hideChanged (value) {
if (this._ready) {
statusMessage(`${this.id}: setting hide to ${value}`);
} else {
statusMessage(`${this.id}: not ready; cannot set hide to ${value}`);
} // if
} // hideChanged

} // class TestTop
customElements.define(module.is, module);

export function report (id, caller, moduleName, childCount) {
//console.debug(`${id}, ${caller}, ${moduleName}`);
const text = `${id}: ${caller} in ${moduleName} has ${childCount} children`;
statusMessage(text, "append");
} // report

export function statusMessage (text, append = logAppend) {
const p = document.createElement("p");
p.appendChild(document.createTextNode(text));
if (shadowRoot) {
const status = shadowRoot.querySelector("#status");
if (!append) status.innerHTML = "";
status.appendChild(p);
} else {
//alert (text);
} // if
} // statusMessage

export function waitForChildren (element, callback) {
let children = Array.from(element.children);
element.addEventListener("elementReady", handleReady);
element.addEventListener("elementReady", handleChildReady);
//statusMessage (`${element.id}: waiting for ${children.length} children`);

function handleChildReady (e) {
if (!children.includes(e.target)) return;
//statusMessage(`${element.id}: child ${e.target.id} is ready`);

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);
//statusMessage(`${element.id}: all children ready`);
signalReady(element);
} // handleChildReady

function handleReady (e) {
if (e.target !== element) return;
element.removeEventListener("elementReady", handleReady);
element._ready = true;
callback.call(element, element.children);
} // handleReady
} // waitForChildren

export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
} // signalReady

export function runPropertyEffects (element) {
const module = element.module;
for (let name in module.properties) {
const definition = module.properties[name];
if (definition.observer) element[definition.observer].call(element, element[name]);
} // for
} // runPropertyEffects 
