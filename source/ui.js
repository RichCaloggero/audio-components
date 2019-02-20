import {PolymerElement} from "./@polymer/polymer/polymer-element.js";
import {statusMessage} from "./audio-context.js";

let savedValues = new Map();

export class UI extends PolymerElement {


keyChanged (value) {
const input = this.shadowRoot.querySelector("input");
console.log(`keyChanged: ${this.id} ${input.nodeName} (${value})`);
if (value && input) input.setAttribute("accesskey", value);
} // keyChanged


reset () {
this.value = (this.max - this.min) / 2.0 + this.min;
} // reset

setMax () {
this.value = this.max;
} // setMax

setMin () {
this.value = this.min;
} // setMin

increase() {
let amount = (this.max-this.min) / 10.0;
this.value = this.clamp(this.value + amount);
} // increase

decrease() {
let amount = (this.max-this.min) / 10.0;
this.value = this.clamp (this.value - amount);
} // decrease

clamp (value, min = this.min, max = this.max) {
return clamp(value, min, max);
} // clamp

static processValues (values) {
if (values instanceof String || typeof(values) === "string") {
values = values.trim();
if (values.charAt(0) !== "[" && values.includes(",") && !values.includes('"')) {
return values.split(",")
.map (value => value.trim());
} else {
try {values = JSON.parse(values);
} catch (e) {values = [];} // catch
} // if
} // if

if (values && (values instanceof Array)) {
values = values.map (value => {
if (typeof(value) !== "object") value = {value: value, text: value};
else if (value instanceof Array) value = {
value: value[0],
text: value.length > 1? value[1] : value[0]
};

return value;
}); // map
} // if

return values;
} // processValues


static addFieldLabels () {
let groupLabel = (this.shadowRoot || this).querySelector (".label, legend");
let hide = !(groupLabel && groupLabel.textContent);
let hideControls = this.hasAttribute ("hide-controls")?
this.getAttribute("hide-controls").split (" ") : [];

if (groupLabel) {
let ancestors = this.ancestors()
.filter ((e) => e && e.hasAttribute("label"))
.map ((e) => {
//console.log (`- ancestor: ${this.elementName(e)}`);
return e;
});
let level = ancestors.length;
//console.log (`ancestors: ${ancestors}`);
console.log (`addFieldLabels: ${this.constructor.is} (${groupLabel.textContent}): level ${level}, add labels to ${hide? "hidden" : "visible"} fields`);

groupLabel.setAttribute ("role", "heading");
groupLabel.setAttribute ("aria-level", level+1);
} // if

Array.from((this.shadowRoot || this).querySelectorAll (".field, ui-number, ui-boolean, ui-list"))
.forEach ((field) => {
let name = field.getAttribute("data-name") || field.getAttribute("field-name") || field.getAttribute("name");

if (hide || hideControls.includes(name)) field.style.display = "none";

if (field.matches("div.field")) {
let name = field.getAttribute("data-name") || field.getAttribute("field-name") || field.getAttribute("name");
let label = field.querySelector("label");
let control = field.querySelector("input, select, textarea");
let id = this._id + "-" + name;
//console.log(`- field: ${name} ${field} ${control} ${label}`);
control.setAttribute("id", id);
label.setAttribute ("for", id);
} // if
}); // forEach field
} // addFieldLabels

ancestors (top) {
let result = [];

let e = this;
if (! e) throw new Error ("ancestors: no host found");

//if (! this.shadowRoot) throw new Error("ancestors: element not connected or -- shadowRoot is null");
//let e = this.shadowRoot.host;


if (!top || !top.nodeType || top.nodeType !== 1) {
top = e.closest("audio-context") || document.querySelector("body");
} // if


while (e && e !== top) {
//console.log (`- ancestors: e=${this.elementName(e)}`);
result.push (e);

e = e.parentElement || e.parentNode.host;
} // while

//result = (result.length > 0)? result.slice(1) : [];
return result;
} // ancestors

} // class UI



export function saveValue (input) {
savedValues.set(input, input.value);
statusMessage(`${input.value}: value saved.`);
} // saveValue

export function swapValues (input) {
if (savedValues.has(input)) {
const old = savedValues.get(input);
savedValues.set(input, input.value);
input.value = old;
statusMessage(old);
} else {
statusMessage(`No saved value; press enter to save.`);
} // if
} // swapValues

