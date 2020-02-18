class _StereoProcessor extends AudioWorkletProcessor {
/*static get parameterDescriptors () {
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
*/

constructor () {
super ();
this.rotation = 0;
this.width = 100;
this.balance = 0;
this.center = 0;


this.port.onmessage = e => {
const data = e.data;
const name = data[0];
const value = data[1];
this[name] = value;
//console.debug(`parameter ${name} set to ${value}`);
};

console.log("AudioWorkletProcessor initialized...");
} // constructor

process (inputs, outputs, parameters) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
if (inputBuffer.length > 0) {
processAudio.call (this, inputBuffer, outputBuffer);
} // if
return true;
} // process
} // class StereoProcessor

function processAudio (inputBuffer, outputBuffer) {
if (inputBuffer.length !== 2 || outputBuffer.length !== 2) throw new Error("processAudio: can only process stereo signals");

const inLeft = inputBuffer[0];
const inRight = inputBuffer[1];
const outLeft = outputBuffer[0];
const outRight = outputBuffer[1];

for (let i = 0; i < inLeft.length; i++) {
const rotated = rotate (inLeft[i], inRight[i], this.rotation);
const rotatedEnhanced = stereoEnhance (rotated[0], rotated[1], this.center, this.width, this.balance);

outLeft[i] = rotatedEnhanced[0];
outRight[i] = rotatedEnhanced[1];
} // for each sample
} // processAudio


registerProcessor("stereo-processor", _StereoProcessor);



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
else if (s0 == -1 && s1 == 1) angle += (2*Math.PI);
else if (spl1 === 0) {
if (spl0 > 0) angle = Math.PI/2; else angle = 3*Math.PI/2;
} else if (spl0 === 0) {
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

