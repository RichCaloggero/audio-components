import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {AudioComponent} from "./audio-component.js";

let instanceCount  = 0;

class AudioParameter extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-parameter">
<legend><h3>{{label}}</h3></legend>
<ui-text label="function" value="{{function}}"></ui-text>
</fieldset>
`; // html
} // get template

static get is() { return "audio-parameter"; }

static get properties () {
return {
label: String,
name: String,
function: {type: String, notify: true, observer: "functionChanged"}
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

functionChanged (value) {this.parentElement.name = this.name;}
} // class AudioDelay
customElements.define(AudioParameter.is, AudioParameter);
