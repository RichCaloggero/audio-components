# Webaudio Components

This project was begun as a way to learn Polymer.

## Elements

The package contains two distinct types of elements:
- connectors
- audio processing elements

The connectors build the connection graph and generally have no UI. They include:
- audio-context
- audio-series
- audio-parallel
- audio-split
- audio-merge

The audio processing elements currently include:
- audio-player
- audio-destination
- audio-gain
- audio-filter
- audio-delay
- audio-pan

## declarative rather than imperative

We wrap everything inside an audio-context element. This corresponds directly to web audio's context node.
The graph is created declaratively based on the given html; no javascript is required.

For instance, here is a simple webaudio graph which takes an audio signal from a file and pipes it through a gain node such that volume can be adjusted, and out to the audio out (typically the computer's standard audio outs):

### Javascript example

```
// we assume there is an standard HTML audio element in the document (our web components create this on the fly in a shadow tree)
 var audio = new AudioContext ();
var audioElement = document.querySelector("#myAudio");
var player = audio.createMediaElementSource (audioElement);
var gain = audio.createGain();

player.connect (gain)
.connect (audio.destination);
```

The above builds the graph and connects all the nodes, but no UI is present. The author is responsible for adding UI elements to control the gain, and the player (or use built-in browser controls for the player).

### HTML example

Here is the same graph created via our audio components:

```
<audio-context><audio-series>
<audio-player src="some-file.mp3"></audio-player>

<audio-gain label="master volume"></audio-gain>

<audio-destination></audio-destination>
</audio-series></audio-context>
```

The player uses the standard browser UI for control (start, stop, seek, volume, etc).
Our web components automatically add UI for specifying audio source file, as well as for controling the gain.

## All elements

All elements, both connectors and audio processors, are web components. They consist of a custom element and its JS class definition.
In the javascript domain, all elements are subclasses of AudioContext.
In the HTML domain, the entire HTML graph needs to be wrapped in a `<audio-context> ... </audio-context>` element.

## Limitations

- control signals not yet implemented
- feedback not yet implemented
- webaudio can deal with more than 2 channels, but this project assumes all elements either 1 or 2 channels
	+ webaudio has notion of channels and destinations which are a bit hard to get my head around
	+ generally nodes are stereo in and stereo out, but they can be mono as well depending on channelCount, channelCountMode
	+ filter and delay are explicitly mono, but others can be either depending on what they are connected to
	
## Processors

These take input from their previous sibling, process it, and pipe output to their next sibling.
If a label attribute is supplied, they display a UI; if no label is supplied then they stay hidden.
All parameters displayed in the UI can be set in the HTML via attributes.

### Style

No attempt has been made to style anything.
I tried to break UI up using simple divs.

### Accessibility

Each component's UI lives in its own region (`role="region"`) and its labeled via `aria-label`.
The group label is specified via HTML `label` attribute on host element.
Because polymer does not encapsulate components completely, IDs still leak out, so we avoid IDref here in favor of `aria-label`.

We also label the group via span element with `role="heading"` and an `aria-level` corresponding to the nesting level of the host element within the audio context.
This helps navigate the UI and maintain a better sense of location within the hierarchy.
We end up with duplicate group label announcement: both the `aria-label` and the visible group label are seen by the screen reader.

- if we eliminate the visible label announcement via `aria-hidden`, we lose the hierarchy info provided by the heading level
- if we eliminate the `aria-label` on the group container, we lose group label announcement on focus (i.e. when tab used to move through the UI) and we lose landmark

There seems to be no good solution for this annoyance at present.

## Connectors

### Series connector

- each child is connected in series to  its siblings, in source order
- _in of first child connects to _in of the series
- _out of last child connects to _out of the series

### Parallel connector

- _in of the parallel connector connects to _in of all children
- _out of each child connects to _out of the parallel connector

### merge

- takes input from previous sibling and merges all its channels into one mono signal
- no children

### Split

- split must have either 1 or 2 children, currently each of which must be a series
	+if 2 children then first child is connected to left channel of input and second to right channel, and outputs are merged back into a stereo signal at the output of split
	+if 1 child  and no attributes, left of input goes to left of output
- the boolean swap-outputs attribute reverses channels on the output
	+ if 2 children then reverses stereo channels at output
	+ if 1 child then left channel of input goes to right channel of output
- the boolean swap-inputs attribute causes channel reversal at the input
	+ with 2 children, same as swap-outputs
	+ with 1 child, causes right of input to go to left of output
- both swap-inputs and swap-outputs on a stereo source with 2 children have no effect
	+ both attributes on stereo source with 1 child pipes right of input to right of output

#### Example 1

```Produeces a tone in left channel only.
Both the oscillator and output gain have UI controls.
The empty series inside split simply passes input to output with unity gain.

```
<audio-context><audio-series>
<audio-oscillator label="my oscillator" frequency="220.0"></audio-oscillator>

<audio-split><audio-series></audio-series></audio-split>

<audio-gain label="master volume" gain=".2"></audio-gain>

<audio-destination></audio-destination>
</audio-series></audio-context>
```

#### Example 2

Same as above, but puts signal only in right channel at destination.

```
<audio-context><audio-series>
<audio-oscillator label="my oscillator" frequency="220.0"></audio-oscillator>

<audio-split swap-outputs><audio-series></audio-series></audio-split>

<audio-gain label="master volume" gain=".2"></audio-gain>

<audio-destination></audio-destination>
</audio-series></audio-context>
```

