import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {module as _AudioContext_, statusMessage, childrenReady} from "./audio-context.js";

let instanceCount = 0;

const module = class AudioSeries extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-series">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<fieldset class="feedback-controls panel">
<legend><h2 aria-level$="{{depth}}">Feedback Controls</h2></legend>
<ui-number label="delay" type="number" value="{{delay}}" min="0" step="0.00001"></ui-number>
<ui-number label="gain" value="{{gain}}" min="-0.99" max="0.99" step="0.01"></ui-number>
</fieldset>
</fieldset>
<slot></slot>
`; // html
} // get template
static get is() { return "audio-series";}

static get properties () {
return {
feedForward: Boolean,
feedBack: {type: Boolean, notify: true, observer: "feedBackChanged"},
delay: {type: Number, value: 0, notify: true, observer: "delayChanged"},
gain: {type: Number, value: 0.5, notify: true, observer: "gainChanged"},
};
} // static properties
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
this.component = new Series(this.audio, this.components(children), this.feedForward, this.feedBack, this);
console.log(`- ${this.id} connected: with ${children.length} children`);
});
} // connectedCallback

feedBackChanged (value) {
if (this._ready && value) {
this.component.gain = this.gain;
this.component.delay = this.delay;
this.showPanel(".feedback-controls");
} else {
this.hidePanel(".feedback-controls");
} // if
} // feedBackChanged

delayChanged (value) {if(this._ready && this.feedBack) this.component.delay = value;}
gainChanged (value) {if(this._ready && this.feedBack) this.component.gain = value;}

} // class AudioSeries

customElements.define(module.is, module);
