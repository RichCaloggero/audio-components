import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {Gen} from "./gen.js";

let instanceCount  = 0;

class AudioGen extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-gen">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<ui-text label="expression" value="{{expression}}" shortcut="control shift f"></ui-text>
</fieldset>
`; // html
} // get template

static get is() { return "audio-gen";}

static get properties () {
return {
expression: {type: String, value: "", notify: true, observer: "expressionChanged"}
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${AudioGen.is}-${instanceCount}`;

this.component = new Gen(this.audio, this);
} // constructor

connectedCallback () {
super.connectedCallback();
//signalReady(this);
} // connectedCallback

expressionChanged (value) {this.component.expression = value;}

} // class AudioGen

customElements.define(AudioGen.is, AudioGen);
