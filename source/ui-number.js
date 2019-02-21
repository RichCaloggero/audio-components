import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UINumber extends UI {
static get template () {
return html`
<div class="ui-number">
<label  for="input">[[label]]</label>
<br><input id="input" type="[[type]]" value="{{value::change}}" min="[[min]]" max="[[max]]" step="{{step::change}}" on-keyup="handleSpecialKeys">
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
shortcut: {type: String, notify: true, observer: "defineKey"}
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `ui-number-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback();
if (this.shortcut) this.defineKey(this.key);
} // connectedCallback

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
case "Enter": if (!e.ctrlKey) this.reset();
else return true;
break;

case "Home": if (e.ctrlKey) this.setMax ();
break;

case "End": if(e.ctrlKey) this.setMin ();
break;

case "PageUp": this.increase();
break;

case "PageDown": this.decrease();
break;

case "-": if(input.type === "number")  {
if (e.shiftKey) input.value *= -1;
else return true;
} else {
input.value *= -1;
} // if
break;

case "0": case "1": return true;

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
this.value = newValue;
} // increase

decrease() {
const newValue = this.clamp (Number(this.value) - stepSize(Number(this.value)));
if (newValue + stepSize(newValue) < Number(this.value)) this.value = this.clamp(Number(this.value) - stepSize(newValue));
else this.value = newValue;
} // decrease

clamp (value, min = this.min, max = this.max) {
console.debug(`clamp: ${this.id}, ${min}, ${max}, ${value}`);
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
let count = 0;
if (n > 1) {
let t = n;
while (t >= 1) {
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
