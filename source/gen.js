import {AudioComponent} from "./audio-component.js";
import {signalReady} from "./audio-context.js";

export class Gen extends AudioComponent {
constructor (audio, parent) {
super (audio, "gen", parent);
this._init = false;
this.input = null;
this.parent = parent;
this.createProcessor(audio);
} // constructor

createProcessor (audio, expression) {
//if (!expression) return;
audio.audioWorklet.addModule("gen.worklet.js")
.then(() => {
this.processor = new AudioWorkletNode(audio, "gen", {
numberOfInputs: 0,
numberOfOutputs: 1,
outputChannelCount: [1],
processorOptions: {expression: expression}
});
this.processor.onprocessorerror = e => {alert(e);}
this.processor.connect(this.wet);
console.debug(`Gen: createProcessor: ${expression}`);

//if (!this._init) {
signalReady(this.parent);
//this._init = true;
//} // if
}).catch(e => alert(`${this.cid}: ${e}`));
} // createProcessor

set expression (value) {
if (this.processor) this.processor.port.postMessage(value);
} // set expression

_set (name, value) {
if (value) this.createProcessor (this.audio, value);
} // _set
} // class Gen

