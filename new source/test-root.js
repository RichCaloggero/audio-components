import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
let instanceCount = 0;
let shadowRoot;
const logAppend = true;

export  const module = class TestRoot extends PolymerElement {
static get is () {return "test-root";}

static get properties () {
return {
id: String,
hide: {type: String, value: "bypass", observer: "hideChanged", notify: true},
}; // return
} // get properties

static get template () {
return html`
<fieldset >
<legend><h2>test-root</h2></legend>
<div id="status" aria-live="polite"></div>
</fieldset>
`;
} // get template

constructor () {
super();
instanceCount += 1;
this._id = `${module.name}-${instanceCount}`;
this.module = module;
this.name = module.name;
this._ready = false;
this.hideOnBypass = this.hasAttribute("hide-on-bypass");

//report (this.id, "constructor", module.name, this.children.length);
} // constructor

get isReady () {return this._ready;}
set isReady (value) {
if (value) {
this._ready = true;
runPropertyEffects(this);
signalReady(this);
} else {
this._ready = false;
} // if
} // set isReady

connectedCallback () {
super.connectedCallback();
this.id = this.id || this._id;
if (!shadowRoot) shadowRoot = this.shadowRoot;

statusMessage(`${this.id} connected with hideOnBypass ${this.hideOnBypass}`);

if (this.name === "TestRoot") waitForChildren(this, (children) => {
statusMessage(`${this.id} ready: ${children.length} children connected`, "append");
statusMessage(`- all connections complete`);
}); // waitForChildren
} // connectedCallback

hideChanged (value) {
if (this._ready) {
this._hide = value?
value.trim().toLowerCase().match(/\w+/g)
: [];
statusMessage(`${this.id}: hide changed to ${this._hide}`);
this.hideOnly(this._hide);

} else {
statusMessage(`${this.id}: not ready; cannot set hide to ${value}`);
} // if
} // hideChanged

hideOnly (labels) {
statusMessage(`${this.id}.hideOnly: ${labels.length} ${typeof(labels[0])}`);
} // hideOnly


/*hideChanged (value) {
if (this._ready) {
statusMessage(`${this.id}: setting hide to ${value}`);
} else {
statusMessage(`${this.id}: not ready; cannot set hide to ${value}`);
} // if
} // hideChanged
*/

} // class TestRoot
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

callback.call(element, element.children);
element.isReady = true;
} // handleChildReady
} // waitForChildren

export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
} // signalReady

export function runPropertyEffects (element) {
const module = element.module;
for (let name in module.properties) {
if (module.properties.hasOwnProperty(name)) {
const definition = module.properties[name];
if (definition.observer) element[definition.observer].call(element, element[name]);
} // if
} // for
} // runPropertyEffects 
