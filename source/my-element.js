import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
//import {_AudioContext_} from "./audio-context.js";

let instanceCount  = 0;

class MyElement extends PolymerElement {
static get template () {
return html`
<div  class="my-element">
<h2>[[value]]</h2>
<label for="input">[[label]]:</label>
<input id="input" type="text">
</div>
`; // html
} // get template

static get is() { return "my-element"; }

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

value: {
type: String,
value: "",
//notify: true,
//observer: "valueChanged"
} // value
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
} // constructor

/*_attachDom(dom) {
//this.appendChild(dom);
this._shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
super._attachDom(dom);
if (this._shadowRoot !== this.shadowRoot) alert ("houston, we have a problem!");
} // _attachDom
*/
connectedCallback () {
super.connectedCallback ();
} // connectedCallback

valueChanged (value) {
} // valueChanged

} // class MyElement


window.customElements.define(MyElement.is, MyElement);
