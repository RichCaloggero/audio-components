import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount  = 0;

class UINumber extends _AudioContext_ {
static get template () {
return html`
<div  class="ui-number">
<label for$="{{id}}">[[label]]</label>
<br><input id="{{id}}" type="range" value="{{value::change}}" min="[[min]]" max="[[max]]" step="{{step::change}}" on-keydown="handleKeydown">
</div>
`; // html
} // get template

static get is() { return "ui-number"; }


static get properties () {
return {
label: String,
min: Number,
max: Number,

step: {
type: Number,
value: 1.0,
notify: true,
observer: "stepChanged"
}, // step

key: {
type: String,
value: "",
notify: true,
observer: "_keyChanged"
}, // key

value: {
type: Number,
value: 0.0,
notify: true,
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = "ui-number" + instanceCount;
} // constructor

_attachDom(dom) {
//this.attachShadow({mode: 'open', delegatesFocus: true});
this.appendChild(dom);
//super._attachDom(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
} // connectedCallback


valueChanged (value) {
//console.log (`number ${this.label || this._id}: new value: ${value}`);
} // valueChanged

stepChanged (value) {
//console.log (`new step: ${value}`);
} // stepChanged

/*_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("input").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("input").removeAttribute ("accesskey");
} // if
} // _keyChanged
*/

handleKeydown (e) {
switch (e.key) {
case "Enter": this.reset();
return false;

case "Home": if (e.ctrlKey) this.setMax ();
return false;

case "End": if(e.ctrlKey) this.setMin ();
return false;

case "PageUp": this.increase ();
return false;

case "PageDown": this.decrease ();
return false;

} // switch

return true;
} // handleKeydown

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
if (value < min) return min;
else if (value > max) return max;
else return value;
} // clamp

nameChanged (value) {
if (! this.label) this.label = value;
} // nameChanged

_position (e) {
//alert ("position");
_AudioContext_._position (e.target);
} // _position

} // class UINumber


function idGen (name) {
return "ui-number" + instanceCount + "-" + name;
} // idGen

window.customElements.define(UINumber.is, UINumber);
