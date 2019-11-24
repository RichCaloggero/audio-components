import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";
import {ChannelSwap} from "./audio-component.js";

let instanceCount  = 0;

class AudioChannelSwap extends _AudioContext_ {
static get template () {
return html``;
} // get template

static get is() { return "audio-channelswap"; }

static get properties () {
return {};
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${AudioChannelSwap.is}-${instanceCount}`;
this.component = new ChannelSwap(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
signalReady(this);
} // connectedCallback

} // class AudioChannelSwap

customElements.define(AudioChannelSwap.is, AudioChannelSwap);
