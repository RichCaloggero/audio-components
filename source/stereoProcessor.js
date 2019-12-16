import {AudioComponent} from "./audio-component.js";
import {signalReady} from "./audio-context.js";

export class StereoProcessor extends AudioComponent {
constructor (audio, parent) {
super (audio, "stereoProcessor", parent);
this.processor = null;
audio.audioWorklet.addModule("stereoProcessor.worklet.js")
.then(() => {
this.processor = new AudioWorkletNode(audio, "stereo-processor");
this.input.connect(this.processor).connect(this.wet);
signalReady(parent);
}).catch(e => alert(`${this.cid}: ${e}`));
} // constructor

set rotation (value) {this._set("rotation", value);}
set center (value) {this._set("center", value);}
set width (value) {this._set("width", value);}
set balance (value) {this._set("balance", value);}

setEnhancer (center, width, balance) {
if (this.processor) {
this._set("center", center);
this._set("width", width);
this._set("balance", balance);
} // if
} // setEnhancer

_set (name, value) {
if (this.processor) {
this.processor.port.postMessage([name, value]);
} // if
} // _set
} // class StereoProcessor

