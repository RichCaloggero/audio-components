import {AudioComponent} from "./audio-component.js";
import {signalReady} from "./audio-context.js";

export class FixedDelay extends AudioComponent {
constructor (audio, delay = 0, parent) {
super (audio, "fixedDelay", parent);
console.debug(`${this.cid}: instantiated with delay ${delay}`);
this.processor = null;
audio.audioWorklet.addModule("fixedDelay.worklet.js")
.then(() => {
this.processor = new AudioWorkletNode(audio, "fixed-delay");
this.input.connect(this.processor).connect(this.wet);
this.sampleCount = this._sampleCount;
signalReady(parent);
}).catch(e => alert(`${this.cid}: ${e}`));
} // constructor

set sampleCount (value) {
this._sampleCount = value;
if (this.processor) {
this.processor.port.postMessage(["sampleCount", this._sampleCount]);
} // if
} // set sampleCount

} // class FixedDelay

