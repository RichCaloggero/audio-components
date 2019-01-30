import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UIText extends UI {
static get template () {
return html`
<div class="ui-text">
<label>[[label]]
<br><input type="text" value="{{value::change}}" on-keydown="handleSpecialKeys">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-text"; }

static get properties () {
return {
label: String,
value: {type: String, value: "", notify: true},
key: {type: String, notify: true, observer: "keyChanged"}
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${UIText.is}-${instanceCount}`;
} // constructor
} // class UIText
customElements.define(UIText.is, UIText);
