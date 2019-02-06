import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_, signalReady} from "./audio-context.js";



let instanceCount = 0;

class AudioReverb extends _AudioContext_{
static get template () {
return html`
<fieldset class="audio-reverb">
<legend><h2>[[label]]</h2></legend>
<ui-boolean name="bypass" label="bypass" value="{{bypass}}"></ui-boolean>
<ui-number label="mix" value="{{mix}}" min="0.0" max="1.0" step="0.1""></ui-number>

<audio-parallel><audio-series>
<audio-gain class="dry-level" gain="0.5"></audio-gain>
</audio-series><audio-series>
<audio-convolver label="convolver" impulse-library="../impulses" default-extension=".wav" hide-controls="bypass" impulses='[
"In The Silo Revised",
"Cement Blocks 2",
"Cement Blocks 1",
"Chateau de Logne, Outside",
"Conic Long Echo Hall",
"Deep Space",
"Derlon Sanctuary",
"Bottle Hall",
"Direct Cabinet N1",
"Direct Cabinet N2",
"Direct Cabinet N3",
"Direct Cabinet N4",
"French 18th Century Salon",
"Five Columns Long",
"Five Columns",
"Going Home",
"Greek 7 Echo Hall",
"In The Silo",
"Highly Damped Large Room",
"Large Bottle Hall",
"Large Long Echo Hall",
"Large Wide Echo Hall",
"Masonic Lodge",
"Musikvereinsaal",
"Narrow Bumpy Space",
"Nice Drum Room",
"On a Star",
"Parking Garage",
"Rays",
"Right Glass Triangle",
"Ruby Room",
"Scala Milan Opera Hall",
"Small Prehistoric Cave",
"Small Drum Room",
"St Nicolaes Church",
"Grig Room",
"Vocal Duo"
]'></audio-convolver>

<audio-gain class="wet-level" gain="0.5"></audio-gain>
</audio-series></audio-parallel>

</div><!-- .audio-reverb -->
`; // html
} // get template
static get is () {return "audio-reverb";}

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

mix: {
type: Number,
value: 0.5,
notify: true,
observer: "mixChanged"
} // mix

}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = "audio-reverb" + instanceCount;
this._init ();
} // constructor

connectedCallback () {
super.connectedCallback ();
this.addFieldLabels ();
this.connectAll ();
} // connectedCallback

connectAll () {
var reverb = this.shadowRoot.querySelector("audio-parallel");
this._audioIn.connect (reverb._in);
reverb._out.connect (this._audioOut);
} // connectAll

mixChanged (value) {
let self = this.shadowRoot;
let dry = self.querySelector(".dry-level");
let wet = self.querySelector (".wet-level");
wet.gain = value;
dry.gain = 1 - value;
} // mixChanged

} // class AudioReverb

window.customElements.define(AudioReverb.is, AudioReverb);
