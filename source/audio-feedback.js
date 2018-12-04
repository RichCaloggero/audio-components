import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
import {_AudioContext_} from "./audio-context.js";

let instanceCount = 0;

class AudioFeedback extends _AudioContext_{
static get template () {
return html`

<div class="audio-feedback" role="region" aria-label$="{{label}}">
<span class="label">[[label]]</span>


<div class="row">
<ui-number name="gain" label="gain" value="{{gain}}" min="0.0" max="1.0" step="0.1"></ui-number>
</div><!-- .row -->

<slot></slot>
</div><!-- .audio-feedback -->
`; // html
} // get template
static get is () {return "audio-feedback";}

static get properties () {
return {
label: {
type: String,
value: ""
}, // label

/*bypass: {
type: Boolean,
notify: true,
observer: "_bypass"
}, // bypass
*/

to: {
type: String,
value: ""
}, // to

gain: {
type: Number,
value: 0.0,
notify: true,
observer: "gainChanged"
} // gain

}; // return
} // get properties

constructor () {
super ();
instanceCount += 1;
this._id = "audio-feedback" + instanceCount;

this._init (audio.createGain());
this._audioIn.disconnect ();
this._audioNode.disconnect();
} // constructor

connectedCallback () {
super.connectedCallback ();
this.whenAllChildrenLoaded (() => {
this.addFieldLabels ();
this.connectFeedback ();
});
} // connectedCallback

connectFeedback () {
this._to = this.firstElementChild;
//console.log (`feedback to ${this._to}`);

if (! this._to) {
alert ("feedback: no child element");
return;
} // if

this._audioIn.connect (this._to._in);
this._to._out.connect (this._audioNode);
this._audioNode.connect (this._audioOut);
this._audioNode.connect (this._audioIn);
this._to._out.connect (this._audioOut);
} // connectFeedback

gainChanged (value) {
this._audioNode.gain.value = value;
} // gainChanged

mixChanged (value) {
let self = this.shadowRoot;
let dry = self.querySelector(".dry-level");
let wet = self.querySelector (".wet-level");
wet.gain = value;
dry.gain = 1 - value;
} // mixChanged

} // class AudioFeedback

window.customElements.define(AudioFeedback.is, AudioFeedback);
