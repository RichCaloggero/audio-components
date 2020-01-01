import {AudioComponent, Series, Delay, Gain, Filter, ChannelSwap} from "./audio-component.js";

export class XTC extends AudioComponent {
 constructor (audio, bandCount = 13, delay = 0.00001, gain=0.89) {
super (audio, "xtc");
this.xtc = new Series(audio, [

this.widener= new Series(audio, [
(this.filter = new Filter(audio, "bandpass", 800, 0.3)),
(this.bands = new Series(audio, createBands(bandCount, delay, gain), "feed forward"))
]), // inner series

(this.bassBoost = new Filter(audio, "lowshelf", 200, 1.0, 2.0)),
(this.makeupGain = new Gain(audio, 2.5))
]); // outer series

this.input.connect(this.xtc.input);
this.xtc.output.connect(this.wet);
this.mix = this.widener.mix.bind(this.widener);

function createBands (count, delay, gain) {
const bands = [];
for (let i=0; i<count; i++) bands[i] = new Series(audio, createBand(delay, gain));
return bands;
} // createBands

function createBand (index, delay, gain) {
// alternate bands switch their stereo orientation and phase
return [
new ChannelSwap(audio),
new Delay(audio, delay),
new Gain(audio, isEven(index)? -gain : gain)
];
} // createBand
} // constructor

set delay (value) {this._setDelays(value);}
set gain (value) {this._setGains (value);}
set frequency (value) {this.filter.filter.frequency.value = value;}
set q (value) {this.filter.filter.Q.value = value;}
set bass (value) {this.bassBoost.filter.frequency.value = value;}
set makeup (value) {this.makeupGain.gain.gain.value = value;}
set enablePreprocessing (value) {this.filter.bypass(!value);}


_setDelays (delay) {
const _delays = () => this.bands.components.map(series => series.components[1]);

_delays().forEach(d => d.delay.delayTime.value = delay);
} // setDelays

_setGains (gain) {
const _gains = () => this.bands.components.map(series => series.components[2]);

_gains().forEach((g,i) => g.gain.gain.value = -gain);
} // setGains
} // class Xtc

function isEven (x) {return x%2 === 0;}
