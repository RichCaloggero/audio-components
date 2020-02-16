import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, childrenReady} from "./audio-context.js";
import {Split} from "./audio-component.js";

let instanceCount = 0;

const module = class AudioSplit extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-split">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>
</fieldset>
<slot></slot>
`; // html
} // get template

static get is() { return "audio-split";}

static get properties () {
return {
label: {type: String, value: ""},
"swap-outputs": Boolean,
"swap-inputs": Boolean
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.container = true;
} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this, children => {
//console.log(`- ${this.nodeName}#${this.id}.connectedCallback.then: found ${children.length} children`);
this.component = new Split(this.audio, this.components(children), this["swap-inputs"], this["swap-outputs"]);
});
} // connectedCallback

} // class AudioSplit

window.customElements.define(module.is, module);
