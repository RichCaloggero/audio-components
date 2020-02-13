import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {module as _AudioContext_, signalReady} from "./audio-context.js";
import {ChannelSwap} from "./audio-component.js";

let instanceCount  = 0;

const module = class AudioChannelSwap extends _AudioContext_ {
static get template () {
return html`
<fieldset class="channel-swap">
<legend><h2 aria-level$="[[depth]]">[[label]]</h2></legend>

<ui-boolean label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="-1" max="1" step=".1"></ui-number>

</fieldset>
`;
} // get template

static get is() { return "audio-channelswap"; }

static get properties () {
return {};
} // get properties

constructor () {
super ();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;
this.module = module;
this.component = new ChannelSwap(this.audio);
} // constructor

connectedCallback () {
super.connectedCallback();
this.isReady = true;
	} // connectedCallback

} // class AudioChannelSwap

customElements.define(module.is, module);
