import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";
import {Split} from "./audio-component.js";

let instanceCount = 0;

class AudioSplit extends _AudioContext_ {
static get template () {
return html`
<div class="audio-split">
<slot></slot>
</div>
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
this.id = `${AudioSplit.is}-${instanceCount}`;
this.ui = false;
} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this)
.then(children => {
//console.log(`- ${this.nodeName}#${this.id}.connectedCallback.then: found ${children.length} children`);
this.component = new Split(this.audio, this.components(children));
this.component.connect(this["swap-inputs"], this["swap-outputs"]);
signalReady(this);
}).catch(error => alert(`audio-split: cannot connect;\n${error}`));
} // connectedCallback

} // class AudioSplit

window.customElements.define(AudioSplit.is, AudioSplit);
