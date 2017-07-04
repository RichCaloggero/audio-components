# Audio Components

This project was begun as a way to learn Polymer.

## Installation

- download via git clone or equivalent
- navigate to root folder and open command prompt
- install polymer if not already installed
	+ npm install -g polymer-cli
- install bower
	+ npm install -g bower
- install polymer runtime
	+ bower install
- run polymer server
	+ polymer serve
- click the `run-demo.bat` file in root folder or open browser to `localhost:8081/demo/`

## Elements

The package contains four distinct types of elements:
- connectors
- audio processing elements
- UI elements
- composed elements
- automation elements

The connectors build the connection graph and the only UI they display is a label and a bypass control. They include:
- audio-context
- audio-series
- audio-parallel
- audio-split
- audio-merge
- audio-feedback

The audio processing elements currently include:
- audio-player
- audio-destination
- audio-gain
- audio-filter
- audio-delay
- audio-pan
- audio-oscillator
- audio-convolver

The UI elements handle UI generation and currently include:
- ui-number
- ui-boolean

The currently implemented automation element is "audio-control", which modifies specified parameters of it's parent element based on mathematical functions in the time domain.
The free variable "t" is the current time stored in the webaudio context node which contains the graph.

The currently implemented composed elements are:
- audio-reverb (based on convolver and a set of public domain impulses), and a couple gain elements
- audio-xtc (crosstalk cancelation network implemented mostly in audio-components html)

## declarative rather than imperative

The graph is created declaratively based on the given html; no javascript is required.
We wrap everything inside an audio-context element. This corresponds directly to web audio's context node.

For instance, here is a simple webaudio graph which takes an audio signal from a file and pipes it through a gain node such that volume can be adjusted, and out to the audio out (typically the computer's standard audio outs):

### Javascript example

```
// we assume there is an HTML audio element in the document (our web components create this on the fly in a shadow tree)
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
If the `label` attribute on the gain element were not present, it's UI would be hidden and it would act as a constant gain whose gain value could be set by a `gain` attribute.

## Limitations

- webaudio can deal with more than 2 channels, but this project assumes all elements either 1 or 2 channels
	+ webaudio has notion of channels and destinations which are a bit hard to get my head around
	+ generally nodes are stereo in and stereo out, but they can be mono as well depending on channelCount, channelCountMode
	+ filter and delay are explicitly mono, but others can be either depending on what they are connected to

## All elements

All elements are implemented as web components. They consist of a custom element and its JS class definition.

In the javascript domain, all elements inherrit directly from `_AudioContext_`.
In the HTML domain, the entire HTML graph needs to be wrapped in a `<audio-context> ... </audio-context>` element.

If a label attribute is supplied, they display a UI; if no label is supplied then they stay hidden.
If they have a `hide-controls` attribute, the value of that attribute is used as a space-separated of field names to hide. Using this, we can display only those fields we need from the element. The `audio-reverb` element uses this to hide the `audio-convolver`'s "bypass" control while still displaying the list of available impulses.
Most parameters displayed in the UI can be set in the HTML via attributes.

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

## Processors

...

## UI Elements

They generate appropriate input controls (type="number" for ui-number, and type="checkbox" for ui-boolean).
The label attribute specifies a label for the control.
The name attribute specifies a name for the control (generally the name of the current element's property which is being exposed.
The value attribute pipes the result back to the current element's property being manipulated.

Numeric controls can also specify min, max, and step, which are passed directly to the underlying html input element.

## Control Elements

The audio-control element allows one to specify a parameter to be automated, and a function to generate values based on the current time stored in the underlying webaudio context containing the graph.
The default evaluation intervall is 0.2 seconds.
The parameter must be specified in the markup, and the element being controled is wrapped within the audio-control element.

The automator function can be specified in markup, and also via the UI.
It is a simple javascript expression which is evaluated in the context of the controled element (i.e. the "this" keyword references the currently controled element).
It references the "Math" object using the javascript "with" statement which allows one to reference Math functions via just their name (i.e. sin(t) instead of Math.sin(t)).

## Connectors

### Series connector

- each child is connected in series to  its siblings, in source order
- _in of first child connects to _in of the series
- _out of last child connects to _out of the series

### Parallel connector

- _in of the parallel connector connects to _in of all children
- _out of each child connects to _out of the parallel connector

### Feedback

The audio-feedback element sends its input to the input of its single child, and sends the output of it's child element to the output of the audio-feedback element, as well as sending it back to it's input, through a gain node. 

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

Both the oscillator and output gain have UI controls.
The empty series inside split simply passes input to output with unity gain.

```
<audio-context><audio-series>
<audio-oscillator label="my oscillator" frequency="220.0"></audio-oscillator>

<audio-split><audio-gain></audio-gain></audio-split>

<audio-gain label="master volume" gain=".2"></audio-gain>

<audio-destination></audio-destination>
</audio-series></audio-context>
```

#### Example 2

Same as above, but puts signal only in right channel at destination.

```
<audio-context><audio-series>
<audio-oscillator label="my oscillator" frequency="220.0"></audio-oscillator>

<audio-split swap-outputs><audio-gain></audio-gain></audio-split>

<audio-gain label="master volume" gain=".2"></audio-gain>

<audio-destination></audio-destination>
</audio-series></audio-context>
```

See `demo/index.html` for a more complex example.

## Composed Elements

### XTC

The audio-xtc element wraps a network made from audio-components into a single element.
This is a good mechanism of abstraction, although it coes require some development setup and understanding of polymer.
However, following the pattern here can make it fairly simple to develop new elements fairly painlessly.

### Reverb

The audio-reverb element is based on audio-convolver and a publically impulse library which is distributed with this project.
