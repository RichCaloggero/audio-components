import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
static get template () {
return html`
<slot></slot>
`; // html
} // get template
static get is() { return "audio-series"; }

static get properties () {
return {
label: String
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioSeries.is}-${instanceCount}`;

} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this)
.then(children => {
//console.log(`- connectedCallback.then: found ${children.length} children`);
this.component = new Series(this.audio, this.components(children));
this.component.mix(1);
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}\n${error.stack}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback
} // class AudioSeries

window.customElements.define(AudioSeries.is, AudioSeries);
