import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_, handleSlotChange, childrenAvailableDelay} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
/*static get template () {
return html`
<slot></slot>
`; // html
} // get template
*/
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

console.log(`${this.id} created.`);
} // constructor

connectedCallback () {
super.connectedCallback();
this.shadowRoot.querySelector("slot").addEventListener("slotchange", handleSlotChange.bind(this));
console.log(`${this.id}: DOM created.`);
} // connectedCallback

childrenAvailable (children) {
setTimeout(() => {
const components = children.map(e => e.component? e.component : e);
console.log(`childrenAvailable: ${components.length}, [${children.map(e => e.localName)}]`);
this.component = new Series(this.audio, components);
}, childrenAvailableDelay);
} // childrenAvailabel
} // class AudioSeries

window.customElements.define(AudioSeries.is, AudioSeries);
