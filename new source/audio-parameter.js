import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, childrenReady, statusMessage} from "./audio-context.js";
import {updateParameter} from "./audio-control.js";

let instanceCount  = 0;

const module = class AudioParameter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-parameter">
<legend><h3 aria-level$="[[depth]]">[[label]]</h3></legend>
<ui-text label="function" value="{{function}}" shortcut="alt shift f"></ui-text>
</fieldset>
<slot></slot>
`; // html
} // get template

static get is() { return "audio-parameter"; }

static get properties () {
return {
name: String,
function: String,
type: {type: String, value: ""},
	}; // return
} // get properties

static get observers () {
return [
"_update(name, function, type)"
];
} // get observers

constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.container = true;
} // constructor

connectedCallback () {
super.connectedCallback();


this.isReady = true;
/*childrenReady(this, children => {
});
*/
} // connectedCallback


_update (_name = "", _function = "", _type = "") {
const controller = this.parentElement;
//debugger;
	if (!controller) return;
	//if (!this._ready || !controller || !controller._ready) return;

	console.debug(`${this.id}: requesting update for ${_name}, ${_function}, ${_type}...`);
if (!_name) return;
if (_function && _type) {
statusMessage(`${this.id}: parameter ${_name} - cannot set both function and type; not updating...`);
return;
} // if

console.debug(`- calling ${controller.id}.updateParameter`);
updateParameter(controller, _name, _function, _type);
} // update
} // class AudioParameter

customElements.define(module.is, module);
