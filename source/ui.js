import {PolymerElement} from "./@polymer/polymer/polymer-element.js";
import {shadowRoot, statusMessage} from "./audio-context.js";

const savedValues = new Map();
const userKeymap = new Map();

export class UI extends PolymerElement {
static get properties () {
return {
label: String,
defaultModifiers: {type: String, value: "alt shift", notify: true},
shortcuts: {type: String, notify: true, observer: "shortcutsChanged"},
shortcut: {type: String, notify: true, observer: "shortcutChanged"},
}; // return
} // get properties

connectedCallback () {
super.connectedCallback();
this.uiElement = this.shadowRoot && this.shadowRoot.querySelector("#input");
if (this.shortcut && this.uiElement) {
console.debug(`UI connected: list is ${this.shortcuts}, key is ${this.shortcut}, element is ${this.uiElement}`);
defineKey(this.shortcut, this.uiElement);
} // if
} // connectedCallback


shortcutChanged (value) {
console.debug(`UI.shortcutChanged: ${value}, ${this.uiElement}`);
defineKey(value, this.uiElement);
} // shortcutChanged

shortcutsChanged (text) {
const list = parseShortcuts(text);
console.debug(`- list is ${list.toSource()}`);
const name = this.name || this.label || "";
console.debug(`UI: looking for ${name} in ${list.map(x => x.parameter)}`);
const shortcut = list.find(x => x.parameter === name);
if (shortcut) {
console.log(`- found ${shortcut.toSource()}`);
this.shortcut = shortcut.shortcut;
} // if
} // shortcutsChanged

handleSpecialKeys (e) {
const key = e.key;
if (!modifierKeys(e) || !allowedUnmodified(key)) return true;
if (handleUserKey(e)) return false;

const input = e.target;
switch (key) {
case " ": if(e.ctrlKey) swapValues(input);
else return true;
break;

case "Enter":
if (e.ctrlKey && e.altKey && e.shiftKey) {
defineKey(getKey(input), input);
} else if(e.ctrlKey) {
saveValue(input);
} else {
return true;
} // if
break;

default: return true;
} // switch

return false;
} // handleSpecialKeys


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

export function getKey (input) {
const dialog = shadowRoot.querySelector("#defineKeyDialog");
const ok = dialog.querySelector(".ok");
const closeButton = dialog.querySelector(".close");

dialog.removeAttribute("hidden");
dialog.querySelector(".control").focus();

closeButton.addEventListener ("click", close);
ok.addEventListener("click", () => {
dialog.setAttribute("hidden", true);
userKeymap.set(input, {
ctrlKey: dialog.querySelector(".control").checked,
altKey: dialog.querySelector(".alt").checked,
shiftKey: dialog.querySelector(".shift").checked,
key: dialog.querySelector(".key").value
}); // callback
close();
}); // ok

function close () {
dialog.setAttribute("hidden", true);
input.focus();
} // close
} // getKey

export function textToKey (text) {
let t = text.split(" ").map(x => x.trim());
if (t.length === 1) t = `${defaultModifiers} ${t[0]}`.split(" ");

const key = {};
key.ctrlKey = (t.includes("control") || t.includes("ctrl"));
key.altKey = t.includes("alt");
key.shiftKey = t.includes("shift");
key.key = t[t.length-1];

if (!key.key) throw new Error(`textToKey: ${text} is an invalid key descriptor; character must be last component as in "control shift x"`);
else if (key.key.toLowerCase() === "space") key.key = " ";
else if (key.key.toLowerCase() === "enter") key.key = "Enter";
else key.key = key.key.substr(0,1).toLowerCase();
return key;
} // textToKey

function findKey (key) {
//console.debug(`looking up ${key.toSource()}`);
const entry = Array.from(userKeymap.entries())
.find(x => compareKeys(key, x[0]));

if (entry) {
console.debug(`found entry ${entry}`);
return entry[1];
} else {
return undefined;
} // if
} // findKey

function compareKeys (k1, k2) {
return (
k1.ctrlKey === k2.ctrlKey
&& k1.altKey === k2.altKey
&& k1.shiftKey === k2.shiftKey
&& k1.key.toLowerCase() === k2.key.toLowerCase()
); // return
} // compareKeys

export function defineKey (text, input) {
if (!input) return;
console.debug(`defining key ${text} ${input}`);
try {
const key = textToKey(text);
if (userKeymap.has(key)) {
const list = userKeymap.get(key);
list.push(input);
userKeymap.set(key, list);
} else {
userKeymap.set(key, [input]);
} // if
} catch (e) {
statusMessage(`invalid key definition: ${text}.`);
} // try
} // defineKey

function eventToKey (e) {
return {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key};
} // eventToKey 

export function handleUserKey (e) {
const elements = findKey(eventToKey(e));
if (elements && elements.length && elements.length > 0) {
const input = e.target;
let focus = elements[0];
if (elements.length > 1) {
focus = findNextFocus(elements, input);
} // if

if (focus) {
focus.focus();
e.preventDefault();
return true;
} // if
} // if

return false;

function findNextFocus (list, item) {
const index = list.indexOf(item);
if (index < 0) return null;
else if (index === list.length - 1) return list[0];
else return list[index+1];
} // findNextFocus
} // handleUserKey

export function modifierKeys (e) {
return e.ctrlKey || e.altKey || e.shiftKey;
} // modifierKeys

function allowedUnmodified (key) {
const allowed = "Enter, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight"
.split(",").map(x => x.trim());

return allowed.includes(key);

} // allowedUnmodified

function parseShortcuts (text) {
console.debug(`parseShortcuts:  ${text}`);
return text.split(",").map(definition => {
console.debug(`- definition: ${definition}`);
const tokens = definition.match(/(\w)+/g);
if (tokens.length < 2) throw new Error(`${definition}: invalid shortcut definition`);
return {parameter: tokens[0], shortcut: tokens.slice(1).join(" ")};
});
} // parseShortcuts
