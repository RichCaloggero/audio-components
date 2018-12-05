import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";


let instanceCount  = 0;

class UIText extends _AudioContext_ {
static get template () {
return html`
<div  class="ui-text">
<label>{{label}}
<br><input type="text" value="{{value::change}}">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-text"; }


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
this._id = "ui-text" + instanceCount;
} // constructor

_attachDom(dom) {
this.shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
} // _attachDom

connectedCallback () {
super.connectedCallback ();
if (! this.name) {
throw new Error ("ui-text: no name given");
} // if
} // connectedCallback

_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("input[type='text']").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("input[type='text']").removeAttribute ("accesskey");
} // if
} // _keyChanged

valueChanged (value) {
} // valueChanged

nameChanged (value) {
if (! this.label) this.label = value;
} // nameChanged

} // class UIText

window.customElements.define(UIText.is, UIText);
