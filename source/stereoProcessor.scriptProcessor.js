import {AudioComponent} from "./audio-component.js";


export class StereoProcessor extends AudioComponent {
constructor (audio, parent) {
super (audio, "stereoProcessor", parent);
this.rotation = this.midSide = this.width = this.balance = 0;

this.processor = audio.createScriptProcessor();
this.processor.addEventListener ("audioprocess", e => processAudio(e.inputBuffer, e.outputBuffer, this.rotation, this.midSide, this.width, this.balance));
this.input.connect(this.processor).connect(this.wet);


function processAudio (inputBuffer, outputBuffer, rotation, midSide, width, balance) {
if (inputBuffer.numberOfChannels !== 2 || outputBuffer.numberOfChannels !== 2) throw new Error("processAudio: can only process stereo signals");

const inLeft = inputBuffer.getChannelData(0);
const inRight = inputBuffer.getChannelData(1);
const outLeft = outputBuffer.getChannelData(0);
const outRight = outputBuffer.getChannelData(1);

for (let i = 0; i < inputBuffer.length; i++) {
const rotated = rotate (inLeft[i], inRight[i], rotation);
const rotatedEnhanced = stereoEnhance (rotated[0], rotated[1], midSide, width, balance);

outLeft[i] = rotatedEnhanced[0];
outRight[i] = rotatedEnhanced[1];
} // for each sample
} // processAudio
} // constructor

setRotation (value) {this.rotation = value;}
setEnhancer (midSide, width, balance) {
this.midSide = midSide;
this.width = width;
this.balance = balance;
} // setEnhancer
} // class StereoProcessor


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

