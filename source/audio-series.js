import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-series">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1.0" max="1.0" step="0.1"></ui-number>

<div class="feedBackControls" hidden>
<ui-number label="feedback delay" type="number" value="{{delay}}" min="0" step="0.00001"></ui-number>
<ui-number label="feedback gain" value="{{gain}}" min="-0.99" max="0.99" step="0.01"></ui-number>
</div>
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
this.id = `${AudioSeries.is}-${instanceCount}`;
this.container = true;
} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this).then(children => {
//console.log(`- connectedCallback.then: found ${children.length} children`);
this.component = new Series(this.audio, this.components(children), this.feedForward, this.feedBack, this);
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}\n${error.stack}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback

feedBackChanged (value) {
if (value) {
this.shadowRoot.querySelector(".feedBackControls").removeAttribute("hidden");
} else {
this.shadowRoot.querySelector(".feedBackControls").setAttribute("hidden", "");
} // if
} // feedBackChanged

delayChanged (value) {if(this.component) this.component.delay = value;}
gainChanged (value) {if(this.component) this.component.gain = value;}

} // class AudioSeries

customElements.define(AudioSeries.is, AudioSeries);
