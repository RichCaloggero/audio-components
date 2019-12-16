class _StereoProcessor extends AudioWorkletProcessor {
static get parameterDescriptors () {
return [{
name: "rotation",
defaultValue: 0,
minValue: -90.0,
maxValue: 90.0,
automationRate: "k-rate"
}, {
name: "width",
defaultValue: 100.0,
minValue: 0.0,
maxValue: 200.0,
automationRate: "k-rate"
}, {
name: "center",
defaultValue: 0,
minValue: -100.0,
maxValue: 100.0,
automationRate: "k-rate"
}, {
name: "balance",
defaultValue: 0,
minValue: -100.0,
maxValue: 100.0,
automationRate: "k-rate"
}];
} // get parameterDescriptors

constructor () {
super ();
console.log("AudioWorkletProcessor started...");
} // constructor

process (inputs, outputs, parameters) {
console.log("process called...");
processAudio(inputs[0], outputs[0], parameters["rotation"][0], parameters["center"][0], parameters["width"][0],  parameters["balance"][0]);
return true;
} // process
} // class StereoProcessor

registerProcessor("stereo-processor", _StereoProcessor);

function processAudio (inputBuffer, outputBuffer, rotation=0, center=0, width=100, balance=0) {
if (inputBuffer.numberOfChannels !== 2 || outputBuffer.numberOfChannels !== 2) throw new Error("processAudio: can only process stereo signals");

const inLeft = inputBuffer.getChannelData(0);
const inRight = inputBuffer.getChannelData(1);
const outLeft = outputBuffer.getChannelData(0);
const outRight = outputBuffer.getChannelData(1);

for (let i = 0; i < inputBuffer.length; i++) {
const rotated = rotate (inLeft[i], inRight[i], rotation);
const rotatedEnhanced = stereoEnhance (rotated[0], rotated[1], center, width, balance);

outLeft[i] = rotatedEnhanced[0];
outRight[i] = rotatedEnhanced[1];
} // for each sample
} // processAudio


function rotate (l, r, rotation) {
let spl0 = l;
let spl1 = r;
const rot = rotation * Math.PI/180; // degrees to radions
const s0 = Math.sign(spl0);
const s1 = Math.sign(spl1);
//let angle = Math.atan( spl0 / spl1 );
let angle = Math.atan( spl1 / spl0 );

//if ((s0 === 1 && s1 === -1) || (s0 == -1 && s1 == -1))  angle += Math.PI;
if ((s0 === 1 && s1 === -1) || (s0 == 1 && s1 == 1))  angle += Math.PI;


if (s0 == -1 && s1 == 1) angle += (2*Math.PI);

if (spl1 === 0) {
if (spl0 > 0) angle = Math.PI/2; else angle = 3*Math.PI/2;
} // if

if (spl0 === 0) {
if (spl1 > 0) angle = 0; else angle = Math.PI;
} // if

angle -= rot;

const radius = Math.sqrt((spl0*spl0) + (spl1*spl1) ) ;
spl0 = Math.sin(angle)*radius;
spl1 = Math.cos(angle)*radius;

return [spl0, spl1];
} // rotate

function stereoEnhance (_l, _r, _midSide, _width, _balance) {
// 3 Way Balancer + Enhancer
const min = Math.min;
const max = Math.max;

const width = _width / 200;
const center = min(_midSide/100+1,1);
const side = (1-_midSide/100);
const left = -min(_balance/100,0);
const left1 = -max(_balance/100-1,-1);
const right = max(_balance/100,0);
const right1 = min(1+_balance/100,1);

let l = _l;
let r = _r;

const mono = (l + r)/2 * center;
const stereo = (l - r) * side;

l = (mono + (stereo*left1 - stereo*right )* width) / max(width,1);
r = (mono + (-stereo*right1 + stereo*left )* width) / max(width,1);

return [l, r];
} // stereoEnhance

