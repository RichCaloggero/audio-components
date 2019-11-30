import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {XTC} from "./audio-component.js";



let instanceCount = 0;

class AudioXtc extends _AudioContext_{
static get template () {
return html`
<fieldset class="audio-xtc">
<legend><h2>[[label]]</h2></legend>
<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1"></ui-number>
</fieldset>
`; // html
} // get template
static get is () {return "audio-xtc";}

static get properties () {
return {
label: String
}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = "audio-xtc" + instanceCount;
this.component = new XTC(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback ();
this.mix = 0.6;
signalReady(this);
} // connectedCallback

} // class AudioXtc

customElements.define(AudioXtc.is, AudioXtc);
