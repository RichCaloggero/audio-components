import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";
import {statusMessage} from "./audio-context.js";

let instanceCount  = 0;

class UIList extends UI {
static get template () {
return html`
<div  class="ui-list">
<label>[[label]]
<br><select  id="input" value="{{value::change}}"  on-keydown="handleSpecialKeys">
</select>
</label>
</div>
`; // html
} // get template
static get is() { return "ui-list"; }


static get properties () {
return {
"initial-value": {type: String, notify: true, observer: "initialValueChanged"},
values: {type: String, notify: true, observer: "valuesChanged"},
value: {type: String, value: "", notify: true, observer: "valueChanged"}
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${UIList.is}-${instanceCount}`;
//console.log(`${this.id} created.`);
} // constructor

connectedCallback () {
super.connectedCallback();
//console.log(`${this.id}: dom created.`);
} // connectedCallback

//initialValueChanged (value) {this.root.querySelector("#input").value = value;}

valuesChanged (value) {
//console.log(`valuesChanged: ${value.length}`);
const list = this._buildList (value);
if (this["initial-value"]) {
list.value = this["initial-value"];
} // if
} // valuesChanged

fixAccessibility (e) {
statusMessage(e.target.value);
} // fixAccessibility

_buildList (newList) {
//console.log(`buildList: ${newList}`);
const list = this.shadowRoot.querySelector("select");
//console.log(`- list: ${list}`);
if (!list) {
console.log("- no list to add items to");
return;
} // if

list.innerHTML = "";

UI.processValues(newList || this.values)
.forEach (pair => {
const option = document.createElement ("option");
option.value = pair.value;
option.text = pair.text;
list.add (option);
}); // forEach

return list;
} // _buildList

} // class UIList

customElements.define(UIList.is, UIList);
