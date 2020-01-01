class _Gen extends AudioWorkletProcessor {

constructor (options) {
super (options);
console.log("worklet options: ", options);
this.expression = options.processorOptions.expression;
//this._function = compileFunction(this.expression);
this.dt = 1/sampleRate;
this.t = 0;

this.port.onmessage = e => {
this.expression = e.data;
};

console.log(`AudioWorkletProcessor initialized; dt = ${this.dt}.`);
} // constructor

set expression (value) {
this._function = compileFunction(value);
this._expression = value;
} // set expression


process (inputs, outputs, parameters) {
const output = outputs[0];

/*if (this._function) {
if (! this.latch) {
console.log(`Gen: using ${this._function}`);
this.latch = true;
} // if
*/

output.forEach(channel => {
const sampleCount = Math.max(channel.length, 128);

for (let i=0; i<sampleCount; i++) {
channel[i] = this._function(this.t);
this.t += this.dt;
} // for
}); // forEach channel

/*} else {
this.latch = false;
console.log(`no function.`);
} // if
*/
return true;
} // process
} // class _Gen

registerProcessor("gen", _Gen);

function compileFunction (text, parameter = "t") {
if (!text) return (t => 0.0);
console.debug(`_Gen: compiling ${text} with parameter ${parameter}`);
try {
const _function = new Function (parameter,
`with (Math) {
function  toRange (x, a,b) {return (Math.abs(a-b) * (x+1)/2) + a;}
function s (x, l=-1.0, u=1.0) {return toRange(Math.sin(x), l,u);}
function c (x, l=-1.0, u=1.0) {return toRange(Math.cos(x), l,u);}
return ${text};
} // Math
`); // new Function
console.log(`- compilation complete.`);
return _function;

} catch (e) {
console.debug(e);
return (t => 0.0);
} // try
} // compileFunction
