import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UIBoolean extends UI {
static get template () {
return html`
<div class="ui-boolean">
<label >[[label]]
<br><input id="input" type="checkbox" checked="{{value::change}}" on-keyup="handleSpecialKeys">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-boolean"; }


static get properties () {
return {
value: {type: Boolean, value: false, notify: true},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `UIBoolean.is}-${instanceCount}`;
} // constructor





} // class UIBoolean

customElements.define(UIBoolean.is, UIBoolean);
