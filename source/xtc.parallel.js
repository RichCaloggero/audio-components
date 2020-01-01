export class XTC extends AudioComponent {
 constructor (audio, bandCount = 8, delay = 0.00001) {
super (audio, "xtc");
this.xtc = new Series(audio, [
this.widener= new Series(audio, [
(this.filter = createFilter("bandpass", 1200, 0.3)),
createBands(bandCount, delay),
]), // inner series
(this.bassBoost = createFilter("lowshelf", 200, 1.0, 4.0)),
(this.makeupGain = createGain(2.5))
]); // outer series

this.input.connect(this.xtc.input);
this.xtc.output.connect(this.wet);
this.mix = this.widener.mix.bind(this.widener);

function createBands (count) {
const p = [];
for (let i=0; i<count; i++) p[i] = createBand(i);
return new Parallel(audio, p);
} // createBands

function createBand (index) {
const d = delay * (index+1);

// alternate bands switch their stereo orientation and phase
const g = (isEven(index)? -1 : 1) * (0.9 - .1*index);
const s = isEven(index)? [new ChannelSwap(audio)] : [];

s.push(createDelay(d));
s.push(createGain(g));
console.debug (`XTC band ${index}: ${s.length === 3}, ${d}, ${g}`);

const band = new Series(audio, s);
band.silentBypass(true);
return band;

function isEven (n= 0) {return n%2 === 0;}
} // createBand

function createGain (gain) {return new Gain(audio, gain);}

function createDelay (delay) {return new Delay(audio, delay);}

function createFilter (type, frequency, q, gain) {return new Filter(audio, type, frequency, q, gain);}
} // constructor


bands () {return this.xtc.components[0].components[1].components;}

delays() {
return this.bands().map(band =>
band.components.length === 3? band.components[1] : band.components[0]);
} // delays

set frequency (value) {this.filter.filter.frequency.value = value;}
set q (value) {this.filter.filter.Q.value = value;}
set delay (value) {this._setDelays(value);}

_setDelays (delay) {
this.delays().forEach((d, i) => d.delay.delayTime.value = delay * (i+1));
} // setDelays

} // class Xtc
