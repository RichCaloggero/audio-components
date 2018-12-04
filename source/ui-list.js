import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class UIList extends _AudioContext_ {
static get template () {
return html`
<div  class="ui-list">
<label>{{label}}
<br><select  size="1" value="{{value::change}}">
</select>
</label>
</div>
`; // html
} // get template
static get is() { return "ui-list"; }


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

values: {
type: String,
value: "",
notify: true,
observer: "valuesChanged"
}, // values

value: {
type: String,
value: "",
notify: true,
observer: "valueChanged"
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this._id = "ui-list" + instanceCount;
} // constructor

_attachDom(dom) {
this.shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
} // _attachDom

connectedCallback () {
if (! this.name) {
throw new Error ("ui-list: no name given");
} // if

super.connectedCallback ();
} // connectedCallback

_buildList () {
let values = null;
let list = this.shadowRoot.querySelector ("select");
this._processValues (this.values).forEach ((value) => {
let option = document.createElement ("option");
option.value = value.value;
option.text = value.text;
list.add (option);
}); // forEach
return values;
} // _buildList

_handleSlotChange (e) {
this.shadowRoot.querySelector("select").innerHTML = "";
this._buildList ();
} // _handleSlotChange


valuesChanged (value) {
this.shadowRoot.querySelector ("select").innerHTML = "";
this._buildList ();
} // valuesChanged

_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("select").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("select").removeAttribute ("accesskey");
} // if
} // _keyChanged

valueChanged (value) {
} // valueChanged

nameChanged (value) {
if (! this.label) this.label = value;
} // nameChanged


} // class UIList


function idGen (name) {
return "ui-list" + instanceCount + "-" + name;
} // idGen

window.customElements.define(UIList.is, UIList);
