import {AudioComponent} from "./audio-component.js";
import {signalReady} from "./audio-context.js";

export class FixedDelay extends AudioComponent {
constructor (audio, parent) {
super (audio, "fixedDelay", parent);
this.processor = null;
audio.audioWorklet.addModule("fixedDelay.worklet.js")
.then(() => {
this.processor = new AudioWorkletNode(audio, "fixed-delay");
this.input.connect(this.processor).connect(this.wet);
//signalReady(parent);
}).catch(e => alert(`${this.cid}: ${e}`));
} // constructor
set sampleCount (value) {this._set("sampleCount", value);}

_set (name, value) {
if (this.processor) {
this.processor.port.postMessage([name, value]);
} // if
} // _set
} // class FixedDelay

