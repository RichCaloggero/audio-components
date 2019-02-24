import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI, defineKey, modifierKeys} from "./ui.js";

let instanceCount  = 0;

class UINumber extends UI {
static get template () {
return html`
<div class="ui-number">
<label  for="input">[[label]]</label>
<br><input id="input" type="[[type]]" value="{{value::change}}" min="[[min]]" max="[[max]]" step="{{step::change}}" on-keydown="handleSpecialKeys">
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
step: {type: Number, value: 0.1},
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
const step = Number(input.step);
//console.debug(`${this.id}.handleSpecialKeys: ${e.ctrlKey}, ${e.key}`);

if (super.handleSpecialKeys(e)) {
switch (e.key) {
case "Enter": if (!e.ctrlKey && this.reset instanceof Function) this.reset();
else return true;
break;

case "Home": if (e.ctrlKey) this.setMax ();
else return true;
break;

case "End": if(e.ctrlKey) this.setMin ();
else return true;
break;

case "PageUp": if (modifierKeys(e)) return true;
else input.value = Number(this.increase());
break;

case "PageDown": if (modifierKeys(e)) return true;
else input.value = Number(this.decrease());
break;

case "-": if(
(input.type === "number" && e.shiftKey)
|| (!modifierKeys(e)))  input.value = -1 * value;
else return true;
break;

case "0": case "1": if (modifierKeys(e)) return true;
else input.value = Number(e.key);
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

increase() {
const newValue = this.clamp(Number(this.value) + stepSize(Number(this.value)));
return newValue;
} // increase

decrease() {
const value = Number(this.value);
const step = Number(stepSize(value));
const newValue = Number(this.clamp (value - step));
const newStep = Number(stepSize(newValue));
console.log(`decrease: ${value}, ${step}, ${newValue}, ${newStep}`);
if (newStep < step) return value - newStep;
else return newValue;
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
else if (n >1 && n <= 10) return 1;
else if(n > 10 && n <= 100) return 10;
else if (n > 100 & n <= 1000) return 100;
else if (n > .1 && n <= 1) return 0.1;
else if (n > .01 && n <= 0.1) return 0.01;
else if (n > .001 && n <= 0.01) return 0.001;
else if (n > 0.0001 && n <= 0.001) return 0.0001;
else if (n <= .0001) return 0.0001;
} // stepSize

/*function stepSize (n) {
let count = 0;
if (n === 1|| n === 0) return 0.1;
if (n >= 1) {
let t = n;
while (t > 1) {
count += 1;
t /= 10;
} // while
count -= 1;

} else if (n < 1) {
let t = n;
while (t < 1) {
count -= 1;
t *= 10;
} // while
} // if

return Math.pow(10, count);
} // stepSize
*/

/*function clamp (value, min, max) {
if (min > max) {
const t = min;
min = max;
max = t;
} // if

if (value > max) return max
else if (value < min) return min;
else return value;
} // clamp
*/
