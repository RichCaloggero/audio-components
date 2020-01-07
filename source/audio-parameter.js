import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady, statusMessage} from "./audio-context.js";
import {updateParameter} from "./audio-control.js";

let instanceCount  = 0;

class AudioParameter extends _AudioContext_ {
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
this.id = `${AudioParameter.is}-${instanceCount}`;
this.container = true;
} // constructor

connectedCallback () {
super.connectedCallback();
if (this.children.length === 0) {
signalReady(this);
} else {
childrenReady(this)
.then(children => {
signalReady(this);
}).catch(error => alert(`audio-control: cannot connect;\n${error}`));
} // if
} // connectedCallback


_update (_name = "", _function = "", _type = "") {
if (!_name) return;
if (_function && _type) {
statusMessage(`${this.id}: parameter ${_name} - cannot set both function and type; not updating...`);
return;
} // if

updateParameter(this.parentElement, _name, _function, _type);
} // update
} // class AudioParameter

customElements.define(AudioParameter.is, AudioParameter);
