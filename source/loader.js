const elementList = [
// UI elements
"./ui-number.js",
"./ui-text.js",
"./ui-list.js",
"./ui-boolean.js",

// connectors
"./audio-context.js",
"./audio-series.js",
"./audio-parallel.js",
"./audio-split.js",
"./audio-channelSwap.js",
"./audio-feedback.js",

// processors
"./audio-player.js",
"./audio-destination.js",
"./audio-oscillator.js",

"./audio-gain.js",
"./audio-filter.js",
"./audio-delay.js",
"./audio-convolver.js",
"./audio-compressor.js",
"./audio-panner.js",
"./audio-equalizer.js",
"./audio-resonance.js",
"./audio-xtc.js",
"./audio-stereoProcessor.js",
"./audio-gen.js",
"./audio-fixedDelay.js",

// automation
"./audio-control.js",
"./audio-parameter.js",

// utilities
//"stereoProcessor.worklet.js",
//"bufferToWave.js"
]; // element list


elementList.forEach (element => {
const script = document.createElement("script");
script.setAttribute("src", element);
script.setAttribute("type", "module");
script.setAttribute("crossorigin", "anonymous");
document.querySelector("head").appendChild(script);
}); // forEach element
