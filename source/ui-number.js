import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI, defineKey, hasModifierKeys} from "./ui.js";

let instanceCount  = 0;

class UINumber extends UI {
static get template () {
return html`
<div class="ui-number">
<label  for="input">[[label]]</label>
<br><input id="input" type="[[type]]" value="{{value::change}}" min="[[min]]" max="[[max]]" step="[[step]]" on-keydown="handleSpecialKeys">
</div>
`; // html
} // get template

static get is() { return "ui-number"; }

static get properties () {
return {
label: String,
type: {type: String, value: "range", notify: true},
value: {type: Number, notify: true},
min: {type: Number, value: 0.0},
max: {type: Number, value: 1.0},
step: {type: Number, value: .1},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `ui-number-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback();
//if (this.shhortcut && this.uiElement) defineKey(this.shortcut, this.uiElement);
} // connectedCallback

shortcutChanged (value) {
console.debug(`number.shortcutChanged: ${value}, ${this.uiElement}`);
defineKey(value, this.uiElement);
} // shortcutChanged

/*_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("input").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("input").removeAttribute ("accesskey");
} // if
} // _keyChanged
*/


handleSpecialKeys (e) {
const input = e.target;
const value = Number(input.value);
const step = Number(this.step);
//console.debug(`number: handling ${hasModifierKeys(e)}, ${e.key}, ${input.type} ${value}`);

if (super.handleSpecialKeys(e)) {
//console.debug(`- parent did not handle it;`);
switch (e.key) {
case "Enter": if (!e.ctrlKey && this.reset instanceof Function) this.reset();
else return true;
break;

case "Home":
if (input.type === "number" && !hasModifierKeys(e)) return true;
if (e.ctrlKey) this.setMax ();
break;

case "End":
if (input.type === "number" && !hasModifierKeys(e)) return true;
if (e.ctrlKey) this.setMin ();
break;

case "PageUp": 
if (hasModifierKeys(e)) return true;
this.increase(10 * step);
break;

case "PageDown": 
if (hasModifierKeys(e)) return true;
this.decrease(10 * step);
break;

case "-": if(
(input.type === "number" && e.shiftKey)
|| (!hasModifierKeys(e)))  input.value = -1 * value;
else return true;
break;

case "0": case "1":
if (input.type === "number" || hasModifierKeys(e)) return true;
input.value = Number(e.key);
break;


default: return true;
} // switch
} // if

input.dispatchEvent(new CustomEvent("change"));
e.preventDefault();
return false;
} // handleSpecialKeys


reset () {
this.value = (this.max - this.min) / 2.0 + this.min;
} // reset

setMax () {
this.value = this.max;
} // setMax

setMin () {
this.value = this.min;
} // setMin

increase(step = this.step) {
return (this.value = Number(this.clamp(Number(this.value) + step)));
} // increase

decrease(step = this.step) {
return (this.value = Number(this.clamp(Number(this.value) - step)));
} // decrease

clamp (value, min = this.min, max = this.max) {
value = Number(value);
min = Number(min);
max = Number(max);
if (value < min) return min;
else if (value > max) return max;
else return value;
} // clamp

nameChanged (value) {
if (! this.label) this.label = value;
} // nameChanged

_position (e) {
_AudioContext_._position (e.target);
} // _position

} // class UINumber


customElements.define(UINumber.is, UINumber);

function stepSize (n) {
n = Math.abs(n);
if (n > 1000) return 1000;
if (n > 100) return 100;
if (n > 10) return 10;
if (n > 1) return 1;
if (n > .1) return .1;
if (n > .01) return .01;
if (n > .001) return .001;
if (n > .0001) return .0001;
else return minStep;
} // stepSize


