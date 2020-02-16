import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_} from "./audio-context.js";
import {Delay} from "./audio-component.js";

let instanceCount  = 0;

const module = class AudioDelay extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-delay">
<legend><h2 aria-level$="[[depth]]">{{label}}</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>
<ui-number label="delay" type="number" value="{{delay}}" min="0.0" max="1.0" step="{{step}}"></ui-number>
</fieldset>
`; // html
} // get template

static get is() { return "audio-delay"; }

static get properties () {
return {
step: {type: Number, value: 0.00001},
delay: {type: Number, value: 0.0, notify: true, observer: "delayChanged"},
}; // return
} // get properties


constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;

this.component = new Delay(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
this.isReady = true;
	} // connectedCallback

delayChanged (value) {if (this.isReady) this.component.delay.delayTime.value = value;}
} // class AudioDelay

customElements.define(module.is, module);
