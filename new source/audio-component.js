import {_setParam, statusMessage} from "./audio-context.js";

const registry = {};
function registerComponent (name, parent) {
const value = registry[name];
if (! value) registry[name] = 1;
else registry[name] += 1;
return `${parent? parent.id + "." : ""}${name}-${registry[name]}`;
} // registerComponent

export class AudioComponent {
constructor (audio, name, parent) {
//console.debug("audioComponent: instantiating ", name);
this.audio = audio;
this.name = name;
this.parent = parent;
this.cid = registerComponent(this.name, this.parent);
this._silentBypass = false;

this.input = audio.createGain();
this.output = audio.createGain();
this.wet = audio.createGain();
this.dry = audio.createGain();
this._bypass = audio.createGain();

this.input.connect(this.dry);
this.input.connect(this._bypass);
this.wet.connect(this.output);
this.dry.connect(this.output);

this.mix(1.0);
this.bypass(false);
console.debug(`component ${name} created`);
} // constructor

silentBypass (value) {
if (value) {
this._silentBypass = true;
this._bypass.gain.value = 0;} else {
this._silentBypass = false;
this._bypass.gain.value = 1.0;
} // if

return this;
} // silentBypass

mix (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
this._mix = this.wet.gain.value = value;
return this;
} // mix

bypass (value) {
if (!this.output) return this;
//console.debug(`${this.name}.bypass ${value} ${this.wet.gain.value} ${this.dry.gain.value} ${this._bypass}`);
if (value) {
this.dry.disconnect();
this.wet.disconnect();
this._bypass.connect(this.output);
} else {
this.dry.connect(this.output);
this.wet.connect(this.output);
this._bypass.disconnect();
} // if
//console.debug(`- ${this.wet.gain.value} ${this.dry.gain.value} ${this._bypass}`);

return this;
} // bypass

isEnabled () {return this._bypass === 0;}

invertPhase (invert) {
/*if (!this.wet) return false;
const gain = this.wet.gain.value;
if (value && gain > 0) gain *= -1;
else if (!value && gain < 0) gain *= -1;
this.wet.gain.value = gain;
*/
} // invertPhase

} // Component

export class Split extends AudioComponent {
constructor (audio, components, swapInputs, swapOutputs) {
super (audio, "split");
this.splitter = this.audio.createChannelSplitter(2);
this.merger = this.audio.createChannelMerger(2);
this.components = components;

if (components.length === 0 || components.length > 2) {
alert("Split: must have at least one, and no more than two child elements");
return;
} // if

this.input.connect(this.splitter);
this.merger.connect(this.wet);
this.connect (swapInputs, swapOutputs);
} // constructor

connect (swapInputs, swapOutputs) {
const channel1 = this.components[0];
const channel2 = this.components.length === 1? null : this.components[1];

//console.debug(`split: swap: ${swapInputs}, ${swapOutputs}`);
if (channel1) {
this.splitter.connect (channel1.input, swapInputs? 1 : 0, 0);
channel1.output.connect (this.merger, 0, swapOutputs? 1 : 0);
console.log(`- channel 1: ${channel1.name} connected`);
} // if

if (channel2) {
this.splitter.connect (channel2.input, swapInputs? 0 : 1, 0);
channel2.output.connect (this.merger, 0, swapOutputs? 0 : 1);
console.log(`- channel 2: ${channel2.name} connected`);
} // if
} // connect
} // class Split

export class Series extends AudioComponent {
constructor (audio, components, feedForward = false, feedBack = false, parent) {
super (audio, "series");
console.debug(`Series: connecting ${components.length} components in series:`);
//if (components.length < 2) throw new Error("Series: need two or more components");
const first = components[0];
const last = components[components.length-1];

if(first.input) {
this.input.connect(first.input);
console.log(`- connected ${this.name} input to ${first.name}`);
} // if

if (first !== last) {
components.forEach((c, i, all) => {
if (i < all.length-1) {
const next = all[i+1];

if (c.output && next.input) {
//c.output.disconnect();
c.output.connect(next.input);
console.log(`- connected ${c.name} to ${next.name}`);

if (feedForward && c !== last) {
c.wet.connect(this.wet);
console.log(`- feedForward: connected ${c.name} to ${this.name} wet`);
} // if

} else {
throw new Error (`series: ${c.name} and ${next.name} must both be AudioComponents`);
} // if
} // if
}); // forEach
} // if

if (last.output) {
last.output.connect(this.wet);
console.log(`- connected ${last.name} to ${this.name} wet`);
} // if

if (feedBack) {
this._delay = audio.createDelay();
this._gain = audio.createGain();
this._delay.delayTime.value = 0;
this._gain.gain.value = 0.5;
this.wet.connect(this._delay).connect(this._gain).connect(this.input);
console.log(`- feedBack: connected ${this.name}.wet to ${this.name}.input`);
} // if

this.components = components;
} // constructor

set gain (value) {if (this._gain) {this._gain.gain.value = value; console.debug(`${this.cid}: feedback gain set to ${value}`);}}
set delay (value) {if (this._delay) this._delay.delayTime.value = value;}
} // class Series

export class Parallel extends AudioComponent {
constructor (audio, components) {
super (audio, "parallel");
if (components.length < 2) throw new Error("Parallel: need two or more components");

//console.debug(`parallel: connecting ${components.length} components in parallel:`);
components.forEach((c, i) => {
if (c.input) {
this.input.connect(c.input);
console.log(`- connecting ${this.name}.input to ${c.name}`);
} // if

if (c.output) {
c.output.connect(this.wet);
console.log(`- connecting ${c.name} to ${this.name}.wet`);
} // if
}); // forEach

this.output.gain.value = 1 / components.length;
this.components = components;
} // constructor
} // class Parallel

export class ReverseStereo extends AudioComponent {
constructor (audio) {
super (audio);
const s = audio.createChannelSplitter(2);
const m = audio.createChannelMerger(2);
this.input.connect(s);
s.connect(m, 0,1);
s.connect(m, 1,0);
m.connect(this.wet);
} // constructor
} // class ReverseStereo

export class Convolver extends AudioComponent {
constructor (audio) {
super(audio, "convolver");
this.node = this.convolver = audio.createConvolver();
this.impulse = null;
this.input.connect(this.convolver);
this.convolver.connect(this.wet);
} // constructor

setImpulse(buffer) {
//console.debug(`Convolver.setImpulse: ${buffer}`);
this.impulse = buffer;
this.convolver.buffer = buffer;
} // setImpulse
} // class Convolver

export class Compressor extends AudioComponent {
constructor (audio) {
super(audio, "compressor");
this.node = this.compressor = audio.createDynamicsCompressor();
this.input.connect(this.compressor);
this.compressor.connect(this.wet);
} // constructor
} // class Compressor

export class Filter extends AudioComponent {
constructor (audio, type = "lowpass", frequency = 300, q = 1.0, gain = 1.0, detune = 0.0) {
super (audio, "filter");
this.node = this.filter = this.audio.createBiquadFilter();
this.filter.type = type;
this.filter.frequency.value = frequency;
this.filter.Q.value = q;
this.filter.gain.value = gain;
this.filter.detune.value = detune;
this.input.connect(this.filter);
this.filter.connect(this.wet);
} // constructor

set type (value) {this.filter.type = value;}
set frequency (value) {this.filter.frequency.value = value;}
set q (value) {this.filter.Q.value = value;}
set gain (value) {this.filter.gain.value = value;}
set detune (value) {this.filter.detune.value = value;}
} // class Filter

export class Delay extends AudioComponent {
constructor (audio, delay = 0.00001, parent) {
super(audio, "delay", parent);
this.node = this.delay = audio.createDelay();
this.delay.delayTime.value = delay;
this.input.connect(this.delay);
this.delay.connect(this.wet);
} // constructor
} // class Delay

export class Oscillator extends AudioComponent {
constructor (audio) {
super(audio, "oscillator");
this.isPlaying = false;
this.input = null;
} // constructor

set(options) {
const isPlaying = this.isPlaying;
if (isPlaying) this.stop();
if (this.oscillator) this.oscillator.disconnect();
this.node = this.oscillator = this.audio.createOscillator();

if (options.type) this.oscillator.type = options.type;
if (options.frequency) this.oscillator.frequency.value = options.frequency;
if (options.detune) this.oscillator.detune.value = options.detune;

this.oscillator.connect(this.wet);
if (isPlaying) this.start();
console.debug(`Oscillator.set: ${options.toSource()}`);
} // set

start () {
if (this.oscillator && !this.isPlaying) {
this.oscillator.start();
this.isPlaying = true;
} // if
} // start

stop () {
if (this.oscillator && this.isPlaying) {
this.oscillator.stop();
this.isPlaying = false;
} // if
} // stop

} // class Oscillator

export class Feedback extends AudioComponent {
constructor (audio, target) {
super (audio, "feedback");
this._delay = audio.createDelay();
this._gain = audio.createGain();
this.target = target;

this.input.connect(this.target.input);
this.target.output.connect(this.wet);
this.connectFeedback();

} // constructor

set gain (value) {this._gain.gain.value = value;}
set delay (value) {this._delay.delayTime.value = value;}

bypass (value) {
super.bypass (value);
if (!value && this.wet && this._delay && this._gain) this.connectFeedback();
} // bypass

connectFeedback () {this.wet.connect(this._delay).connect(this._gain).connect(this.input);}
} // class Feedback

export class Panner extends AudioComponent {
constructor (audio) {
super (audio, "panner");
this.node = this.panner = audio.createPanner();
this.panner.channelCount = 1;
this.panner.channelCountMode = "explicit";
this.input.connect(this.panner);
this.panner.connect(this.wet);
this.panner.panningModel = "HRTF";
this.panner.setOrientation(0, 0, 0);
audio.listener.setOrientation(0,0,-1,0,1,0);
} // constructor

set x (value) {__set(this, "positionX", value);}
set y (value) {__set(this, "positionY", value);}
set z (value) {__set(this, "positionZ", value);}


} // class Panner

export class Gain extends AudioComponent {
constructor (audio, _gain = 1.0, parent) {
super (audio, "gain", parent);
this.node = this.output;
this.input.connect(this.output);
this.node.gain.value = _gain;
} // constructor

set gain (value) {this.node.gain.value = value;}
} // class Gain

export class Binaural extends AudioComponent {
constructor (audio) {
super (audio, "binaural");
const s = audio.createChannelSplitter(2);
this.leftPanner = audio.createPanner();
this.rightPanner = audio.createPanner();
this.leftPanner.panningModel = this.rightPanner.panningModel = "HRTF";
this.leftPanner.refDistance = this.rightPanner.refDistance = 10;

this.input.connect(s);
s.connect(this.leftPanner, 0).connect(this.wet);
s.connect(this.rightPanner, 1).connect(this.wet);
} // constructor


setPosition (a, r) {
//console.debug("setPosition: ", a, r);
this.leftPanner.positionX.value = r*Math.cos(a);
this.leftPanner.positionY.value = r*Math.sin(a);
//this.leftPanner.positionZ = Math.sin(a + r) * Math.cos(a - r);
this.leftPanner.positionZ.value = r*Math.cos(a+r/3+r/6+r/9);

this.rightPanner.positionX.value = r*Math.sin(-1*a);
this.rightPanner.positionY.value = r*Math.cos(-1*a);
//this.rightPanner.positionZ = Math.cos(a + r) * Math.sin(a - r);
this.rightPanner.positionZ.value = r*Math.sin(-1*a-r/3+r/6-r/9);
} // setPosition

} // class Binaural

export class Equalizer extends AudioComponent {
constructor (audio, bands = {base: 30, count: 10, q: 4.5, frequency: (base, index) => base * 2**index}) {
super (audio, "equalizer", bands);
this.filters = initialize(bands);
const container = new Parallel(this.audio, this.filters);
this.input.connect(container.input);
container.output.connect(this.wet);
this.reset();

function initialize (bands) {
const filters = [];
if (bands instanceof Array) {
bands.forEach((band, i) => filters[i] = createFilter(band.frequency, band.q, band.gain));
} else if (bands instanceof Object && band.base && band.frequency && bands.count) {
for (let i = 0; i<bands.count; i++) filters[i] = createFilter(bands.frequency(i, bands.base), bands.q, 1);
} // if
return filters;
} // initialize

function createFilter(i, frequency, q, gain) {
const f = audio.createFilter();
f.type = "peaking";
f.frequency = frequency;
f.gain = gain;
f.Q = q;
f.detune = 0;
return f;
} // createFilter

} // constructor

get bandCount () {return this.filters.length;}

reset () {this.filters.forEach(filter => this.resetFilter(filter));}

validBandIndex (i) {return (i>=0 && i<this.bandCount);}

setGain (i, gain) {if (validBandIndex(i)) this.filters[i].gain = gain;}
setQ (i, q) {if (validBandIndex(i)) this.filters[i].Q = q;}
setFrequency (i, frequency) {if (validBandIndex(i)) this.filters[i].frequency = frequency;}

resetFilter (filter) {
filter.filter.type = "peaking";
filter.filter.gain.value = 0;
filter.filter.detune.value = 0;
} // resetFilter

set q (value) {
this.filters.forEach(filter => filter.filter.Q.value = value);
} // set q
} // class Equalizer

export class Phaser extends AudioComponent {
constructor (audio, bandCount = 1) {
super (audio);
this.bandCount = bandCount;
this.filters = [];
this.filterComponent = null;
const reverse = new ReverseStereo(audio);
reverse.mix(1); // all wet
this.delay = audio.createDelay();

while (bandCount-- > 0) {
const f = audio.createBiquadFilter();
f.type = "allpass";
this.filters.push(f);
} // while

this.input.connect(reverse.input);
reverse.output.connect(this.delay).connect(this.filters[0]).connect(this.wet);
} // constructor

series () {
this.filterComponent = new Series(this.audio, this.filters);
this.input.connect(this.filterComponent.input);
this.filterComponent.connect(this.output);
} // series

parallel () {
this.filterComponent = new Parallel(this.audio, this.filters);
this.input.connect(this.filterComponent.input);
this.filterComponent.connect(this.output);
} // parallel
} // class Phaser


export class ChannelSwap extends AudioComponent {
constructor (audio) {
super (audio, "ChannelSwap");
const s = audio.createChannelSplitter(2);
const m = audio.createChannelMerger(2);
this.input.connect(s);
s.connect(m, 0,1);
s.connect(m, 1,0);
m.connect(this.wet);
} // constructor
} // class ChannelSwap

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
//signalReady(parent);
}).catch(e => alert(`${this.cid}: ${e}`));
} // constructor

set sampleCount (value) {
this._sampleCount = value;
if (this.processor) {
this.processor.port.postMessage(["sampleCount", this._sampleCount]);
} // if
} // set sampleCount

} // class FixedDelay


/*export class Verb extends AudioComponent {
constructor (audio, elementCount = 500, parent) {
super (audio, "Verb", parent);
this.elements = [];
const gain = audio.createGain();
const compressor = audio.createDynamicsCompressor();
for (let i=0; i<elementCount; i++) {
const d = this.elements[i] = new Delay(audio);
this.input.connect(d.input);
d.output.connect(gain);
} // for
gain.connect(compressor).connect(this.wet);
compressor.threshold.value = -20.0;
compressor.knee.value = 10;
compressor.ratio.value = 20;

this.setDelays ();
console.log(`${this.name}: ${this.elements.length} delays initialized`);
} // constructor

setDelays (minDelay=0.001, maxDelay=1.0, minGain=0.1, maxGain=0.98) {
statusMessage(`${minDelay}, ${maxDelay}, ${minGain}, ${maxGain}`);
this.elements.forEach(d => {
d.delay.delayTime.value = random(minDelay, maxDelay);
d.wet.gain.value = random(minGain, maxGain);
 }); // forEach

statusMessage(`${this.name}: ${this.elements.length} delays changed`);
} // setDelays
} // class Verb
*/


	function createFilterBank (audio, frequencies) {
return frequencies.map (frequency => {
const filter = new Filter(audio);
filter.filter.frequency.value = frequency;
return filter;
}); // map return filters;
} // createFilterBank

function random (min, max) {return Math.random() * Math.abs(max-min) + min;}

function __set (object, name, value) {
if (object.node && name in object.node) _setParam(object.node[name], value);
} // __set
