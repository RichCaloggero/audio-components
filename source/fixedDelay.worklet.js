class _FixedDelay extends AudioWorkletProcessor {

constructor () {
super ();
this.sampleCount = 0; // samples

this.port.onmessage = e => {
const data = e.data;
const name = data[0];
const value = data[1];
this[name] = value;
//console.debug(`parameter ${name} set to ${value}`);
};

console.log("_FixedDelay AudioWorkletProcessor initialized...");
} // constructor

set sampleCount (count) {
this.delayBuffer = [
new Float32Array(count),
new Float32Array(count)
];
this._sampleCount = count;
} // set sampleCount

process (inputs, outputs, parameters) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];

if (inputBuffer.length > 0 && inputBuffer.length <= 2) {
inputBuffer.forEach((channel, i) => processChannel(this._sampleCount, channel, outputBuffer[i], this.delayBuffer[i]));
} // if
return true;
} // process
} // class StereoProcessor

registerProcessor("fixed-delay", _FixedDelay);

function processChannel (_count, _in, _out, _delay) {
_out.set(_delay, 0);
_out.set(_in.slice(0, _count), _count);
_delay.set(_in.slice(_in.length-_count, _in.length-_count), 0);
} // processChannel
