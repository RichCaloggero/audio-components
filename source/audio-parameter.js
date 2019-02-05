import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount  = 0;

class AudioParameter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-parameter">
<legend><h3>[[label]]</h3></legend>
<ui-text label="function" value="{{function}}" key="f"></ui-text>
</fieldset>
`; // html
} // get template

static get is() { return "audio-parameter"; }

static get properties () {
return {
name: {type: String, notify: true, observer: "nameChanged"},
function: {type: String, notify: true, observer: "functionChanged"},
key: {type: String, value: "f", notify: true},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioParameter.is}-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

nameChanged (value) {
this.parentElement.name = value;
this.parentElement.function = this.function;
} // nameChanged

functionChanged (value) {
this.parentElement.function = value;
this.parentElement.name = this.name;
}
} // class AudioParameter
customElements.define(AudioParameter.is, AudioParameter);
