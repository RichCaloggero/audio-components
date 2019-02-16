export class AudioComponent {
constructor (audio, name) {
//console.debug("audioComponent: instantiating ", name);
this.audio = audio;
this.name = name;

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
} // constructor

mix (value) {
//console.debug(`mix: ${this.name} ${this.value} ${!this.output} ${!this.wet}`);
this.dry.gain.value = 1-Math.abs(value);
return (this._mix = this.wet.gain.value = value);
} // mix

bypass (value) {
if (!this.output) return;
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
constructor (audio, components) {
super (audio, "split");
const s = this.audio.createChannelSplitter(2);
const m = this.audio.createChannelMerger(2);

if (components.length === 0 || components.length > 2) {
alert("Split: must have at least one, and no more than two child elements");
return;
} // if

const channel1 = components[0];
const channel2 = components.length === 1? null : components[1];

if (channel1) {
s.connect (channel1.input, this.swapInputs? 1 : 0, 0);
channel1.output.connect (m, 0, this.swapOutputs? 1 : 0);
console.log(`- channel 1: ${channel1.name} connected`);
} // if

if (channel2) {
s.connect (channel2.input, this.swapInputs? 0 : 1, 0);
channel2.output.connect (m, 0, this.swapOutputs? 0 : 1);
console.log(`- channel 2: ${channel2.name} connected`);
} // if

this.input.connect(s);
m.connect(this.wet);
} // constructor
} // class Split

export class Series extends AudioComponent {
constructor (audio, components) {
super (audio, "series");
//console.debug(`Series: connecting ${components.length} components in series:`);
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
} // constructor
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
this.convolver = audio.createConvolver();
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
this.compressor = audio.createDynamicsCompressor();
this.input.connect(this.compressor);
this.compressor.connect(this.wet);
} // constructor
} // class Compressor

export class Filter extends AudioComponent {
constructor (audio) {
super (audio, "filter");
this.filter = this.audio.createBiquadFilter();
this.input.connect(this.filter);
this.filter.connect(this.wet);
} // constructor
} // class Filter

export class Delay extends AudioComponent {
constructor (audio) {
super(audio, "delay");
this.delay = audio.createDelay();
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
this.oscillator = this.audio.createOscillator();

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

} // class Delay

export class Feedback extends AudioComponent {
constructor (audio, target) {
super (audio, "feedback");
this.delay = audio.createDelay();
this.gain = audio.createGain();
this.target = target;

this.input.connect(this.target.input);
this.target.output.connect(this.wet);
this.connectFeedback();

this.delay.delayTime.value = 0;
this.gain.gain.value = 0.5;
} // constructor

bypass (value) {
super.bypass (value);
if (!value && this.wet && this.delay && this.gain) this.connectFeedback();
} // bypass

connectFeedback () {this.wet.connect(this.delay).connect(this.gain).connect(this.input);}
setGain (value) {this.gain.gain.value = value;}
setDelay (value) {this.delay.delayTime.value = value;}
} // class Feedback

export class Panner extends AudioComponent {
constructor (audio) {
super (audio, "panner");
this.panner = audio.createPanner();
this.panner.channelCount = 1;
this.panner.channelCountMode = "explicit";
this.input.connect(this.panner);
this.panner.connect(this.wet);
this.panner.panningModel = "HRTF";
this.panner.setOrientation(0, 0, 0);
audio.listener.setOrientation(0,0,-1,0,1,0);
} // constructor
} // class Panner

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
constructor (audio, frequencies) {
super (audio, "equalizer");
this.filters = createFilterBank(audio, frequencies);
const container = new Parallel(this.audio, this.filters);
this.input.connect(container.input);
container.output.connect(this.wet);
this.reset();
} // constructor

get bandCount () {return this.filters.length;}

reset () {this.filters.forEach(filter => this.resetFilter(filter));}

resetFilter (filter) {
filter.filter.Q.value = 1;
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

export class Xtc extends AudioComponent {
constructor (audio) {
super (audio);
const s = audio.createChannelSplitter(2);
const m = audio.createChannelMerger(2);
this.filter = audio.createBiquadFilter();
this.filter.type = "bandpass";
this.leftDelay = audio.createDelay(), this.rightDelay = audio.createDelay();
const left = audio.createGain(), right = audio.createGain();
left.gain.value = right.gain.value = -1;
this.feedback = audio.createGain();
this.feedback.gain.value = 0;

this.input.connect(this.filter).connect(s);
s.connect(left, 0).connect(this.leftDelay).connect(m, 0,1);
s.connect(right, 1).connect(this.rightDelay).connect(m, 0,0);
m.connect(this.wet);
m.connect(this.feedback).connect(s);
} // constructor
} // class Xtc

function createFilterBank (audio, frequencies) {
return frequencies.map (frequency => {
const filter = new Filter(audio);
filter.filter.frequency.value = frequency;
return filter;
}); // mapreturn filters;
} // createFilterBank
