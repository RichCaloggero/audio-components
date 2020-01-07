import {html} from "./@polymer/polymer/polymer-element.js";
import {Parallel} from "./audio-component.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";

let instanceCount = 0;

class AudioParallel extends _AudioContext_ {
static get template () {
return html`
<fieldset class="audio-parallel">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1" max="1" step=".1"></ui-number>
</fieldset>

<slot></slot>
`; // html
} // get template
static get is() { return "audio-parallel";}

static get properties () {
return {
label: String
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioParallel.is}-${instanceCount}`;
this.container = true;
} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this)
.then(children => {
//console.log(`- connectedCallback.then: found ${children.length} children`);
this.component = new Parallel(this.audio, this.components(children));
if (this.uiControls().every(x => x.hidden)) this.shadowRoot.querySelector("legend").hidden = true;
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}\n${error.stack}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback
} // class AudioParallel

customElements.define(AudioParallel.is, AudioParallel);
