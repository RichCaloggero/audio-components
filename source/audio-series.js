import {html} from "./@polymer/polymer/polymer-element.js";
import {AudioComponent, Series} from "./audio-component.js";
import {_AudioContext_, childrenReady, signalReady} from "./audio-context.js";

let instanceCount = 0;

class AudioSeries extends _AudioContext_ {
/*static get template () {
return html`
<div><slot></slot></div>
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

} // constructor

connectedCallback () {
super.connectedCallback();
childrenReady(this)
.then(children => {
console.log(`- connectedCallback.then: found ${children.length} children`);
const components = children.map(e => {
if (e.component) return e.component;
else throw new Error(`audio-series: e.nodeName.toLowerCase()}.component is null -- cannot connect`);
});
this.component = new Series(this.audio, components);
signalReady(this);
}).catch(error => {
console.log(`${this.id}: ${error}`);
alert(`${this.id}: ${error}`);
}); // catch
} // connectedCallback

/*childrenAvailable (children) {
setTimeout(() => {
const components = children.map(e => e.component? e.component : e);
console.log(`- childrenAvailable: ${components.length}, [${children.map(e => e.localName)}]`);
this.component = new Series(this.audio, components);
}, childrenAvailableDelay);
} // childrenAvailabel
*/
} // class AudioSeries

window.customElements.define(AudioSeries.is, AudioSeries);
