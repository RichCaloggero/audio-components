// white-noise-processor.js
class WhiteNoiseProcessor extends AudioWorkletProcessor {
static get parameterDescriptors () {
return [{
name: "gain",
min: 0, max: 1
}];
} // get parameterDescriptors


process (inputs, outputs, parameters) {
console.log("process()...");
const output = outputs[0]
output.forEach(channel => {
for (let i = 0; i < channel.length; i++) {
channel[i] = (Math.random() * 2 - 1) * .1
}
})
return true
}
}

registerProcessor('white-noise-processor', WhiteNoiseProcessor)