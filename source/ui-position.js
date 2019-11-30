import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {UI} from "./ui.js";

let instanceCount  = 0;

class UIPosition extends UI {
static get template () {
return html`
<div class="ui-position">
<label id="label">[[label]]</label>
<span role="application" tabindex="0" aria-labelledby="label" role="group">
{{value::change}}
</span>
</div>
`; // html
} // get template

static get is() { return "ui-position"; }


static get properties () {
return {
label: String,
value: {type: String, notify: true},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `UIPosition.is}-${instanceCount}`;
} // constructor



handleKeydown (e) {
let text = e.target.textContent.trim();
const vector = text.split(",").map(x => Number(x.trim()));
console.log(`vector: ${vector}`);
switch (e.key) {
case "ArrowRight": vector[0] = clamp(vector[0]+1); break;
case "ArrowLeft": vector[0] = clamp(vector[0]-1); break;

case "ArrowUp": vector[2] = clamp(vector[2]+1); break;
case "ArrowDown": vector[2] = clamp(vector[2]-1); break;

case "u": vector[1] = clamp(vector[1]+1); break;
case "d": vector[1] = clamp(vector[1]-1); break;

case "Tab": case "Escape": return true;

default: return false;
} // switch

e.target.textContent = vector.join(",");
e.target.dispatchEvent(new CustomEvent("change"));
return false;
} // handleKeydown

} // class UIPosition

customElements.define(UIPosition.is, UIPosition);
