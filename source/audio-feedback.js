import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";
import {Feedback} from "./audio-component.js";


let instanceCount = 0;

class AudioFeedback extends _AudioContext_{
static get template () {
return html`
<fieldset class="audio-feedback">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0" max="1" step="0.1"></ui-number>

<ui-number label="delay" value="{{delay}}" min="0" max="1.0" step="0.000002"></ui-number>
<ui-number label="gain" min="-0.99" value="{{gain}}" max="0.99" step="0.01"></ui-number>
</fieldset>
<slot></slot>
`; // html
} // get template

static get properties () {
return {
delay: {type: Number, value: 0, notify: true, observer: "delayChanged"},
gain: {type: Number, value: .5, notify: true, observer: "gainChanged"},
}; // return
} // get properties

static get is () {return "audio-feedback";}

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioFeedback.is}-${instanceCount}`;
} // constructor

connectedCallback () {
super.connectedCallback ();
childrenReady(this)
.then(children => {
const target = this.components(children)[0];
this.component = new Feedback(this.audio, target);
this.component.gain = this.gain;
this.component.delay = this.delay;
signalReady(this);
}); // childrenReady
} // connectedCallback

delayChanged (value) {if(this.component) this.component.delay = value;}
gainChanged (value) {if(this.component) this.component.gain = value;}

} // class AudioFeedback

customElements.define(AudioFeedback.is, AudioFeedback);
