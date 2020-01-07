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
</fieldset>
<slot></slot>
`; // html
} // get template
static get is() { return "audio-series";}

static get properties () {
return {
"feed-forward": Boolean,
"feed-back": Boolean
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
this.component = new Series(this.audio, this.components(children), this["feed-forward"], this["feed-back"], this);
//if (this.uiControls().every(x => x.hidden)) this.shadowRoot.querySelector("legend").hidden = true;
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}\n${error.stack}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback
} // class AudioSeries

customElements.define(AudioSeries.is, AudioSeries);
