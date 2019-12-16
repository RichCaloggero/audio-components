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

setRotation (value) {if (this.processor) this.processor.parameters.get("rotation").value = value;}
setEnhancer (center, width, balance) {
if (this.processor) {
this.processor.parameters["center"].value = center;
this.processor.parameters["width"].value = width;
this.processor.parameters["balance"].value = balance;
} // if
} // setEnhancer
} // class StereoProcessor

