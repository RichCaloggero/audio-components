import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI, defineKey} from "./ui.js";

let instanceCount  = 0;

class UIText extends UI {
static get template () {
return html`
<div class="ui-text">
<label>[[label]]
<br><input id="input" type="text" value="{{value::change}}" on-keydown="handleSpecialKeys">
</label>
</div>
`; // html
} // get template

static get is() { return "ui-text"; }

static get properties () {
return {
label: String,
value: {type: String, value: "", notify: true},
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${UIText.is}-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback();
//if (this.shhortcut && this.uiElement) defineKey(this.shortcut, this.uiElement);
} // connectedCallback

shortcutChanged (value) {
console.debug(`ui-text.shortcutChanged: ${value}, ${this.uiElement}`);
defineKey(value, this.uiElement);
} // shortcutChanged

handleSpecialKeys (e) {
const key = e.key;
const input = e.target;
//console.debug(`${this.id}.handleSpecialKeys: ${e.ctrlKey}, ${e.key}`);

if (super.handleSpecialKeys(e)) {
switch (key) {
case "Enter": if (e.ctrlKey) return true;
break;

default: return true;
} // switch
} // if

e.preventDefault();
e.target.dispatchEvent(new CustomEvent("change"));
} // handleSpecialKeys
} // class UIText

customElements.define(UIText.is, UIText);
