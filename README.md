# Audio Components

This project was begun as a way to learn Polymer.
<<<<<<< HEAD
THis release is now based on Polymer 3, therefore it has been rewritten to use javascript modules instead of html modules.

## Installation

- download via git clone or equivalent
- all sources are in the source folder and each independant elements which can be loaded via a script tag:
=======
Polymer has evolved since, so this version is a major rewrite to align with polymer 3.
The most significant change is the use  of javascript modules rather than HTML imports.

## Installation

- download a .zip file (not necessary to clone unless you need to submit a pull request)
- use `loader.js` to load everything except `resonance-audio.min.js` which must be loaded separately:
	+ `script src="loader.js"></script>`
- alternatively, each element can be independantly loaded via a script tag:
>>>>>>> dev
	+ `<script src="audio-delay.js" type="module" crossorigin="anonymous"</script>`

## Elements

The package contains five distinct types of elements:
<<<<<<< HEAD
=======

>>>>>>> dev
- context (from which all others are inherrited, and which directly wraps the webaudio AudioContext node)
- connectors
- audio processing elements
- UI elements
- automation elements

<<<<<<< HEAD
The connectors build the connection graph. They currently include:
=======
### The connectors build the connection graph. They currently include:

>>>>>>> dev
- audio-context
- audio-series
- audio-parallel
- audio-split
- audio-feedback

### The audio processing elements wrap the webaudio nodes which actually do the heavy lifting, as well as provide a UI by which to control the processing. They currently include:

- audio-player
- audio-destination
- audio-gain
- audio-filter
- audio-delay
- audio-panner
- audio-oscillator
- audio-convolver
- audio-reverb
- audio-compressor
- audio-equalizer (10 band graphic equalizer)
- audio-resonance (provides access to Google's resonance audio system which does room simulation)
<<<<<<< HEAD
=======

### The UI elements handle UI generation and currently include:
>>>>>>> dev

- ui-number
- ui-boolean
- ui-list
- ui-text

<<<<<<< HEAD
The currently implemented automation elements are "audio-control" and "audio-parameter". 
Audio-control  modifies specified parameters of it's parent element based on mathematical functions in the time domain. The free variable "t" is the current time stored in the webaudio context node which contains the graph.  
Audio-parameter specifies the parameter to be automated and a javascript function which generates values for the parameter. It must be wrapped inside an audio-control element and must appear *after* the element whose parameters are being automated. See examples for more details.
=======
### The currently implemented automation elements are "audio-control" and "audio-parameter". 

- Audio-control  modifies specified parameters of it's parent element based on mathematical functions in the time domain. The free variable "t" is the current time stored in the webaudio context node which contains the graph.  
- Audio-parameter specifies the parameter to be automated and a javascript function which generates values for the parameter. It must be wrapped inside an audio-control element and must appear *after* the element whose parameters are being automated. See examples for more details.
>>>>>>> dev

## declarative rather than imperative

The graph is created declaratively based on the given html; no javascript is required.
We wrap everything inside an audio-context element. This corresponds directly to web audio's context node.

## Example 1

Here is the markup for a simple webaudio graph which takes an audio signal from a file and pipes it through a gain node such that volume can be adjusted, and out to the audio out (typically the computer's standard audio outs):

```
<audio-context label="example1"><audio-series>
<audio-player src="some-file.mp3"></audio-player>
<audio-gain label="master volume"></audio-gain>
<audio-destination></audio-destination>
</audio-series></audio-context>
```


The player contains three buttons: play/pause, forward, and back.
Our web components automatically add UI for specifying audio source file, as well as for controling the gain.
If the `label` attribute on the gain element were not present, it's UI would be hidden and it would act as a constant gain whose gain value could be set by a `gain` attribute.

### Javascript example

Here is the same graph, built via javascript using webaudio directly. 

```
var audio = new AudioContext ();
var audioElement = document.querySelector("#myAudio");
var player = audio.createMediaElementSource (audioElement);
var gain = audio.createGain();

player.connect (gain)
.connect (audio.destination);
```

The above builds the graph and connects all the nodes, but no UI is present. The author is responsible for adding UI elements to control the gain, and the player (or use built-in browser controls for the player).
## Limitations

<<<<<<< HEAD
### Same example using audio-components

Here is the same graph created via our audio components:

```
<audio-context label="example1"><audio-series>
<audio-player src="some-file.mp3"></audio-player>
<audio-gain label="master volume"></audio-gain>
<audio-destination></audio-destination>
</audio-series></audio-context>
```
=======
- webaudio can deal with more than 2 channels, but this project assumes all elements either 1 or 2 channels

## Basic Architecture

All elements are implemented as web components, and create new HTML elements (known as custom elements in webcomponents parlents). They consist of an html template which generates the UI, and an associated JS class definition.
>>>>>>> dev

In the javascript domain, all `audio-` elements inherrit from `_AudioContext_`, which itself inherrits from `PolymerElement`. all `ui-` elements inherrit from `UI` which lives in `ui.js`.  

There are a small set of extra libraries which comprise a simple component model and provide lower level implementations of many of the processing elements.

<<<<<<< HEAD
- webaudio can deal with more than 2 channels, but this project assumes all elements either 1 or 2 channels
=======
- `audio-component.js` is the module which implements the component model and exports class `AudioComponent`
- `room.js` is an additional component which works with `resonance-audio` and also inherrits from `AudioComponent`
>>>>>>> dev

In the HTML domain, the entire HTML graph needs to be wrapped in a `<audio-context> ... </audio-context>` element.

If a label attribute is supplied on an element, it display a UI; without a label, an element is hidden, but still takes part in the graph using parameters supplied in the markup.

If a `hide` attribute is present on an element, the value of that attribute is used as a comma-separated list of field names to hide. A field name is the label shown in the UI when the element is used.

<<<<<<< HEAD
If a label attribute is supplied, they display a UI; if no label is supplied then they stay hidden.
If a `hide` attribute is present on an element, the value of that attribute is used as a comma-separated list of field names to hide. 

Most parameters displayed in the UI can be set in the HTML via attributes. For instance, including the boolean attribute `bypass` on an element will boot it up in bypass mode; as long as the UI for the bypass control is not hidden, the user can change it's value at any time via a checkbox in the element's UI.

### Accessibility

Each component's UI lives in its own fieldset  and is labeled via `legend` which wraps an `h2` element containing the label provided via the element's `label` attribute. If `label` is not provided, the entire UI for that element is hidden.  If audio-parameter elements are present, they wrap their labels in `h3` elements. 

=======
Most parameters displayed in the UI can be set in the HTML via attributes. For instance, including the boolean attribute `bypass` on an element will boot it up in bypass mode; as long as the UI for the bypass control is not hidden, the user can change it's value at any time via a checkbox in the element's UI.

### Accessibility

Each component's UI lives in its own fieldset  and is labeled via `legend` which wraps an `h2` element containing the label provided via the element's `label` attribute. If `label` is not provided, the entire UI for that element is hidden.  If audio-parameter elements are present, they wrap their labels in `h3` elements. 

All elements are controlable via the keyboard.
Shortcut keys can be specified in markup.  The user can also add a shortcut to an element via the UI.

Most controls have native keyboard control as defined via HTML5. However, we have added extra features.

#### Numeric Parameters

They come in two flavors: input of type `number` and inputs of type `range`.

- number can be edited directly via standard editing keys; range is a simple slider
- both types support movement via up/down arrows and page up/down, with page up/down moving by larger amounts
- both types use control+home to set to largest allowed value, and control+end to set smallest value
- both support saving current value via control+enter and swapping with current value via control+space
- slider can be set to zero via the "0" key, and one via the "1" key
>>>>>>> dev

## UI Elements

The `ui-` elements generate single controls. The label attribute specifies a label for the control. 
The `label` or `name` attribute, whichever is present, is used as the name of the parameter to be manipulated. The element which uses the control must insure that the parameter it exposed via polymer's properties or observers mechanism.
The value attribute pipes the result back to the current element's property being manipulated.

Numeric controls can also specify min, max, and step, which are passed directly to the underlying html input element.


## Control Elements

<<<<<<< HEAD
The audio-control element allows one to specify a parameter to be automated, and a function to generate values based on the current time stored in the underlying webaudio context containing the graph. THe `audio-control` element must wrap the element to which automation is to be applied as it's first child, and any additional children must be `audio-parameter` elements specifying at least the name of the parameter being automated. If a `function` attribute is specified in markup, then it is taken to be the default function used to generate parameter values; this can be manipulated in the UI as long as the `function` attribute is not present in the element's hide list.
=======
The audio-control element allows one to specify a parameter to be automated, and a function to generate values based on the current time stored in the underlying webaudio context. The `audio-control` element must wrap the element to which automation is to be applied as it's first child.

Any additional children of `audio-control` must be `audio-parameter` elements specifying at least the name of the parameter being automated. If a `function` attribute is specified in markup, then it is taken to be the default function used to generate parameter values; this can be manipulated in the UI as long as the `function` attribute is not present in the audio-parameter's hide list.
>>>>>>> dev


The automator function  is a simple javascript expression which is evaluated in the context of the controled element (i.e. the "this" keyword references the currently controled element).
It references the "Math" object using the javascript "with" statement which allows one to reference Math functions via just their name (i.e. sin(t) instead of Math.sin(t)). The variable `t` is the free variable and it contains the current time, in seconds, of the currently running audio context.


## Connectors

### Series connector

- each child is connected in series to  its siblings, in source order
- _in of first child connects to _in of the series
- _out of last child connects to _out of the series

### Parallel connector

- _in of the parallel connector connects to _in of all children
- _out of each child connects to _out of the parallel connector

### Feedback

The audio-feedback element sends its input to the input of its single child, and sends the output of it's child element to the output of the audio-feedback element, as well as sending it back to it's input, through a delay node. A delay node *must* be included in a closed loop in the graph, thus we provide a delay node by default here so the feedback will always work.



### Split

- split must have either 1 or 2 children
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

#### Example 2

This sends the output of an oscillator to the right speaker only:

The gain elements inside split hide their UI since they have no label. Their gain defaults to unity, so in a sense they are simply placeholders. The split is only being used here to swap channels.

```
<audio-context><audio-series>
<audio-oscillator label="oscillator" frequency="250"></audio-oscillator>
<audio-split swapOutputs>
<audio-gain></audio-gain>
<audio-gain></audio-gain>
</audio-split>
```
