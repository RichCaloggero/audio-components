import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-series">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0" max="1" step=".1"></ui-number>
</fieldset>
<slot></slot>
`; // html
} // get template
static get is() { return "audio-series"; }

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioSeries.is}-${instanceCount}`;
this.ui = false;
this.hide = "bypass, mix";
} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this)
.then(children => {
//console.log(`- connectedCallback.then: found ${children.length} children`);
this.component = new Series(this.audio, this.components(children));
if (this.uiControls().every(x => x.hidden)) this.shadowRoot.querySelector("legend").hidden = true;
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}\n${error.stack}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback
} // class AudioSeries

customElements.define(AudioSeries.is, AudioSeries);
