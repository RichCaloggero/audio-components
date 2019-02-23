import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";
import {updateParameter} from "./audio-control.js";

let instanceCount  = 0;

class AudioParameter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-parameter">
<legend><h3>[[label]]</h3></legend>
<ui-text label="function" value="{{function}}" shortcut="alt shift f"></ui-text>
</fieldset>
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
"update(name, function)"
];
} // get observers

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioParameter.is}-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

update (_name, _function) {
if (!_name) return;
if (!_function) _function = "";
updateParameter(this.parentElement, _name, _function);
} // update

} // class AudioParameter
customElements.define(AudioParameter.is, AudioParameter);
