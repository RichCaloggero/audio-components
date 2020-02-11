import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
let instanceCount = 0;
let shadowRoot;

export  const module = class TestTop extends PolymerElement {
static get is () {return "test-top";}

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
this.id = `${module.is}-${instanceCount}`;

//report (this.id, "constructor", module.name, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();
if (!shadowRoot) shadowRoot = this.shadowRoot;

waitForChildren(this, () => {
report (this.id, "connectedCallback", module.name, this.children.length);
}); // waitForChildren
} // connectedCallback

} // class TestTop
customElements.define(module.is, module);

export function report (id, caller, moduleName, childCount) {
//console.debug(`${id}, ${caller}, ${moduleName}`);
const text = `${id}: ${caller} in ${moduleName} has ${childCount} children`;
statusMessage(text, "append");
} // report

export function statusMessage (text, append) {
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

function handleReady (e) {
if (!children.includes(e.target)) return;
children = children.filter(x => x !== e.target);
if (children.length > 0) return;
element.removeEventListener("elementReady", handleReady);
callback.call(element);
signalReady(element);
} // handleReady
} // waitForChildren

export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
} // signalReady
