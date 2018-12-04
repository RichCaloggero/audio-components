import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class UIBoolean extends _AudioContext_ {
static get template () {
return html`
<div  class="ui-boolean">
<label>{{label}}
<br><input type="checkbox" checked="{{value::change}}">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-boolean"; }


static get properties () {
return {
name: {
type: String,
value: "",
notify: true,
observer: "nameChanged"
}, // name

label: {
type: String,
value: ""
}, // label

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
observer: "valueChanged"
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = "ui-boolean" + instanceCount;
} // constructor

_attachDom(dom) {
this.shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
if (! this.name) {
throw new Error ("ui-boolean: no name given");
} // if
//console.log ("connectedCallback...");
} // connectedCallback

_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("input[type='checkbox']").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("input[type='checkbox']").removeAttribute ("accesskey");
} // if
} // _keyChanged

valueChanged (value) {
} // valueChanged


nameChanged (value) {
if (! this.label) this.label = value;
} // nameChanged

} // class UIBoolean

function idGen (name) {
return "ui-boolean" + instanceCount + "-" + name;
} // idGen

window.customElements.define(UIBoolean.is, UIBoolean);
