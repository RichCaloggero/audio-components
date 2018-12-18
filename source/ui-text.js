import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UIText extends UI {
static get template () {
return html`
<div class="ui-text">
<label>[[label]]
<br><input type="text" value="{{value::change}}">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-text"; }

static get properties () {
return {
label: {type: String, notify: true},
value: {type: String, value: "", notify: true},
key: {type: String, value: "", notify: true}, // key
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${UIText.is}-${instanceCount}`;
} // constructor


_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("input[type='text']").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("input[type='text']").removeAttribute ("accesskey");
} // if
} // _keyChanged

} // class UIText

window.customElements.define(UIText.is, UIText);
