import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UIList extends UI {
static get template () {
return html`
<div  class="ui-list">
<label>[[label]]
<br><select  value="{{value::change}}">
</select>
</label>
</div>
`; // html
} // get template
static get is() { return "ui-list"; }


static get properties () {
return {
label: String,
key: {
type: String,
value: "",
notify: true,
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
} // value
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



valuesChanged (value) {
//console.log(`valuesChanged: ${value.length}`);
const list = this._buildList (value);
} // valuesChanged

_keyChanged (value) {
if (value) {
let key = value.charAt(0);
this.shadowRoot.querySelector ("select").setAttribute ("accesskey", key);
} else {
this.shadowRoot.querySelector ("select").removeAttribute ("accesskey");
} // if
} // _keyChanged


} // class UIList

window.customElements.define(UIList.is, UIList);
