import {PolymerElement} from "./@polymer/polymer/polymer-element.js";

export class AudioComponent  extends PolymerElement {
constructor (audio) {
this.audio = audio;
this.input = audio.createGain();
this.output = audio.createGain();
this.wet = audio.createGain();
this.dry = audio.createGain();

this.input.connect(this.dry);
this.wet.connect(this.output);
this.dry.connect(this.output);
} // constructor

mix (value) {
this.dry.gain.value = 1-value;
this.wet.gain.value = value;
return value;
} // mix

bypass (value) {
if (value) {
saveState();
this.wet.disconnect();
this.mix(0);
} else {
this.wet.connect(this.output);
restoreState();
} // if

function saveState () {this._mix = this.wet.gain.value;} // saveState
function restoreState () {this.mix(this._mix);} // restoreState
} // bypass

_connect (input, output) {
if (input instanceof Component) input = input.input;
if (output instanceof Component) output = output.input;
return input.connect(output);
} // _connect

disconnect () {
this.output.disconnect();
} // disconnect
} // Component

export class Series extends Component {
constructor (audio, components) {
super (audio);
if (components.length < 2) throw new Error("Series: need two or more components");
components.forEach((c, i, all) => {
c.disconnect();
if (i < all.length-1) this._connect(c, all[i+1]);
}); // forEach

this._connect(this.input, components[0]);
this._connect(components[components.length-1], this.wet);
} // constructor
} // class Series

export class Parallel extends Component {
constructor (audio, components) {
super (audio);
if (components.length < 2) throw new Error("Parallel: need two or more components");
const output = audio.createGain();
output.gain.value = 1 / components.length;

components.forEach((c, i) => {
c.disconnect();
this._connect(this.input, c);
this._connect(c, output);
}); // forEach

output.connect(this.wet);
} // constructor
} // class Parallel

export class ReverseStereo extends Component {
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

export class Binaural extends Component {
constructor (audio) {
super (audio);
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
//console.log("setPosition: ", a, r);
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

export class Phaser extends Component {
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

export class Xtc extends Component {
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
