# Audio Components System Architecture

A native Web Components library for building declarative audio processing applications using the Web Audio API.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [File Reference](#file-reference)
- [Design Patterns](#design-patterns)
- [Component Lifecycle](#component-lifecycle)
- [Audio Signal Flow](#audio-signal-flow)

---

## Overview

This library provides a set of custom HTML elements that wrap the Web Audio API, allowing developers to create complex audio processing graphs using declarative HTML syntax. The system uses native Web Components (no framework dependencies) with ES6 modules.

### Key Features

- **Declarative Audio Graphs**: Define audio processing chains in HTML
- **Two-Layer Architecture**: Separation between UI/DOM layer and audio model
- **Composable Containers**: Nest audio components in series or parallel configurations
- **Built-in Automation**: Time-based parameter control with JavaScript expressions
- **Screen Reader Accessibility**: Designed with accessibility in mind (e.g., `not()` function instead of `!`)

---

## System Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    HTML/DOM Layer                        │
│                                                          │
│   <audio-gain>, <audio-filter>, <audio-series>, etc.    │
│   (Extend AudioComponentBase - HTMLElement)             │
│   - Shadow DOM rendering                                │
│   - User interface controls                             │
│   - Component lifecycle management                      │
└─────────────────────────────────────────────────────────┘
                         │
                         │ delegates to
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Audio Graph Model Layer                     │
│                                                          │
│   Gain, Filter, Series, Parallel classes                │
│   (Pure JavaScript - no DOM)                            │
│   - Creates Web Audio API nodes                         │
│   - Manages audio connections                           │
│   - Implements signal processing logic                  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Web Audio API (Browser Native)               │
│                                                          │
│   AudioContext, GainNode, BiquadFilterNode, etc.        │
└─────────────────────────────────────────────────────────┘
```

### Dependency Graph

```
utility.js (shared utilities)
    ▲
    │
audio-component-base.js (HTML element base class)
    ▲
    ├── audio-context.js (root context element)
    ├── audio-player.js (media playback)
    ├── audio-gain.js
    ├── audio-delay.js
    ├── audio-filter.js
    ├── audio-compressor.js
    ├── audio-convolver.js
    ├── audio-oscillator.js
    ├── audio-panner.js
    ├── audio-destination.js
    ├── audio-stereoProcessor.js
    ├── audio-channelSwap.js
    ├── audio-series.js
    ├── audio-parallel.js
    ├── audio-split.js
    ├── audio-control.js
    └── audio-parameter.js

audio-component.js (audio model classes)
    ▲
    └── (all audio-* components import their model class)

ui.js (UI base class)
    ▲
    ├── ui-number.js
    ├── ui-boolean.js
    ├── ui-text.js
    ├── ui-list.js
    └── ui-position.js
```

---

## File Reference

### Core Infrastructure

| File | Purpose |
|------|---------|
| **utility.js** | Shared utility functions. Contains the `not()` function for screen reader accessibility (replaces `!` operator). |
| **audio-component-base.js** | Base class for all audio HTML elements. Provides shadow DOM rendering, lifecycle management, ready-state signaling, and common properties (label, bypass, mix, hide). |
| **audio-component.js** | Pure audio model classes. Contains `AudioComponent` base class and all audio node implementations (Gain, Delay, Filter, Series, Parallel, etc.). No DOM dependencies. |

### Context and Playback

| File | Purpose |
|------|---------|
| **audio-context.js** | Root `<audio-context>` element. Creates and manages the Web AudioContext, handles global settings, automation timing, and buffer management. Must wrap all other audio components. |
| **audio-player.js** | `<audio-player>` element. Wraps HTML5 `<audio>` element for media file playback. Provides play/pause controls and connects to the audio graph. |

### Basic Audio Nodes

| File | Element | Purpose |
|------|---------|---------|
| **audio-gain.js** | `<audio-gain>` | Volume control using GainNode |
| **audio-delay.js** | `<audio-delay>` | Delay effect using DelayNode |
| **audio-filter.js** | `<audio-filter>` | EQ/filter using BiquadFilterNode (lowpass, highpass, bandpass, shelf, notch, allpass, peaking) |
| **audio-compressor.js** | `<audio-compressor>` | Dynamics compression using DynamicsCompressorNode |
| **audio-convolver.js** | `<audio-convolver>` | Convolution reverb using ConvolverNode with impulse response files |
| **audio-oscillator.js** | `<audio-oscillator>` | Tone generation using OscillatorNode (sine, square, sawtooth, triangle) |
| **audio-panner.js** | `<audio-panner>` | 3D spatial positioning using PannerNode |
| **audio-destination.js** | `<audio-destination>` | Output to speakers using AudioDestinationNode |
| **audio-stereoProcessor.js** | `<audio-stereoprocessor>` | Stereo field manipulation (width, balance, rotation, center) |
| **audio-channelSwap.js** | `<audio-channelswap>` | Swap left/right channels |

### Container/Routing Components

| File | Element | Purpose |
|------|---------|---------|
| **audio-series.js** | `<audio-series>` | Connects child components in series (chain). Supports feedback loops with delay. |
| **audio-parallel.js** | `<audio-parallel>` | Connects child components in parallel (mix multiple paths). |
| **audio-split.js** | `<audio-split>` | Channel splitting and routing. |

### Automation and Control

| File | Element | Purpose |
|------|---------|---------|
| **audio-control.js** | `<audio-control>` | Container for automation. Runs parameter updates on timer interval. |
| **audio-parameter.js** | `<audio-parameter>` | Defines automated parameter. Uses JavaScript expressions with time variable `t`. |

### UI Components

| File | Element | Purpose |
|------|---------|---------|
| **ui.js** | (base class) | Base class for all UI controls. Handles keyboard shortcuts, value binding, and event dispatch. |
| **ui-number.js** | `<ui-number>` | Numeric input with slider. Attributes: label, min, max, step, value. |
| **ui-boolean.js** | `<ui-boolean>` | Checkbox toggle. Attributes: label, value. |
| **ui-text.js** | `<ui-text>` | Text input field. Attributes: label, value. |
| **ui-list.js** | `<ui-list>` | Dropdown select. Attributes: label, value, values (comma-separated options). |
| **ui-position.js** | `<ui-position>` | 3D position input (x, y, z coordinates) with keyboard navigation. |

### Utilities

| File | Purpose |
|------|---------|
| **setops.js** | Set operations: union, intersection, difference, equals. |
| **bufferToWave.js** | Convert AudioBuffer to WAV format for export. |
| **stereoProcessor.js** | Audio worklet processor for stereo field manipulation. |

### Test Files

| File | Purpose |
|------|---------|
| **test-root.js** | Legacy test/demo component (still uses Polymer). |
| **test-native.html** | HTML test page for native Web Components. |

---

## Design Patterns

### Wrapper Pattern

Each audio component consists of two objects:

1. **HTML Element** (e.g., `AudioGain` extends `AudioComponentBase`)
   - Provides UI, shadow DOM, and lifecycle
   - Stored as `this` (the web component instance)

2. **Audio Model** (e.g., `Gain` class from audio-component.js)
   - Contains pure audio logic
   - Stored in `this.component`
   - Created during construction

```javascript
// HTML Layer (audio-gain.js)
class AudioGain extends AudioComponentBase {
    constructor() {
        super();
        this.component = new Gain(this.audio, this._gainValue, this);
    } // constructor

    set gain(value) {
        this._gain = value;
        if (this.component) {
            this.component.gain = value;
        } // if
    } // set gain
} // class AudioGain

// Model Layer (audio-component.js)
class Gain extends AudioComponent {
    set gain(value) {
        this.node.gain.value = value;
    } // set gain
} // class Gain
```

### Ready-State Pattern

Components signal readiness using events. This is critical for containers that must wait for children:

```
1. connectedCallback() fires
2. Container calls childrenReady(this, callback)
3. Waits for 'elementReady' events from all audio children
4. When all children ready:
   - Build audio graph connections
   - Create component model
   - Set this.isReady = true
5. isReady setter:
   - Runs pending property effects
   - Calls signalReady()
   - Dispatches 'elementReady' event to parent
```

### Property Binding Pattern

Properties synchronize between attributes, internal state, and audio nodes:

```javascript
static get observedAttributes() {
    return ['gain', 'label', 'bypass'];
} // get observedAttributes

attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'gain') {
        this.gain = Number(newValue);
    } // if
    super.attributeChangedCallback(name, oldValue, newValue);
} // attributeChangedCallback

get gain() {
    return this._gain;
} // get gain

set gain(value) {
    this._gain = Number(value);
    if (this._ready && this.component?.node) {
        this.component.node.gain.value = this._gain;
    } // if
} // set gain
```

### UI Event Binding Pattern

UI controls connect to component properties via events:

```javascript
_setupEventListeners() {
    const gainControl = this.shadowRoot.querySelector('ui-number[label="gain"]');
    if (gainControl) {
        gainControl.value = this._gain;
        gainControl.addEventListener('value-changed', (e) => {
            this.gain = e.detail.value;
        });
    } // if gainControl
} // _setupEventListeners
```

---

## Component Lifecycle

### Initialization Flow

```
1. constructor()
   - Call super()
   - Initialize default values
   - Create audio model (this.component = new ModelClass(...))
   - Generate unique ID

2. connectedCallback()
   - Call super.connectedCallback()
   - Render shadow DOM template
   - For leaf nodes: this.isReady = true
   - For containers: call childrenReady(this, callback)

3. isReady = true (setter)
   - Run deferred property effects
   - Call signalReady()
   - Dispatch 'elementReady' event

4. _setupEventListeners() (called after ready)
   - Bind UI controls to properties
   - Set initial control values
```

### Attribute Change Flow

```
1. HTML attribute changes (e.g., gain="0.5")
2. attributeChangedCallback(name, old, new) fires
3. Update internal property (this.gain = Number(newValue))
4. Property setter updates:
   - Internal state (this._gain)
   - Audio model (this.component.gain)
   - UI control (if applicable)
```

---

## Audio Signal Flow

### Standard Component Signal Path

Every `AudioComponent` has this internal structure:

```
                    ┌─────────┐
         ┌────────►│   dry   │────────┐
         │         └─────────┘        │
         │                            ▼
input ───┤         ┌─────────┐    ┌───────┐
         ├────────►│   wet   │───►│output │───►
         │         │ (node)  │    └───────┘
         │         └─────────┘        ▲
         │                            │
         │         ┌─────────┐        │
         └────────►│ bypass  │────────┘
                   └─────────┘
```

### Mix and Bypass Behavior

**mix(value)**: Blends wet (processed) and dry (original) signals
- `mix = 0`: 100% dry signal
- `mix = 1`: 100% wet signal
- `mix = 0.5`: 50% blend

**bypass(true)**: Routes input directly to output
- Disconnects wet and dry paths
- Only bypass path active

**silentBypass()**: Mutes the component entirely
- Sets bypass gain to 0
- Used for disabling without clicks

### Container Connections

**Series** (`<audio-series>`):
```
input → child1 → child2 → child3 → output
                    ↑__feedback__↓ (optional)
```

**Parallel** (`<audio-parallel>`):
```
         ┌─► child1 ─┐
input ───┼─► child2 ─┼───► output (mixed)
         └─► child3 ─┘
```

---

## Example Usage

```html
<audio-context>
    <audio-player src="music.mp3"></audio-player>

    <audio-series label="Effects Chain">
        <audio-filter label="High Pass" type="highpass" frequency="80"></audio-filter>
        <audio-compressor label="Dynamics" threshold="-20" ratio="4"></audio-compressor>
        <audio-gain label="Output" gain="0.8"></audio-gain>
    </audio-series>

    <audio-destination></audio-destination>
</audio-context>
```

This creates an audio graph that:
1. Plays an audio file
2. Passes it through a high-pass filter at 80Hz
3. Compresses the dynamics
4. Reduces output volume to 80%
5. Outputs to speakers

---

## Accessibility Notes

This library is designed with screen reader accessibility in mind:

- **`not()` function**: Used instead of `!` operator because screen readers often skip the exclamation character
- **Closing brace comments**: Added to all code blocks (e.g., `} // class AudioGain`) for easier navigation
- **Keyboard shortcuts**: UI controls support keyboard navigation
- **ARIA attributes**: Being progressively added to components

---

## Migration from Polymer

This codebase has been migrated from Polymer to native Web Components. The migration involved:

1. Replacing Polymer base classes with `HTMLElement`
2. Using native `customElements.define()` instead of Polymer registration
3. Manual shadow DOM creation instead of Polymer templates
4. Native `observedAttributes` and `attributeChangedCallback` instead of Polymer observers
5. ES6 modules instead of HTML imports

Only `test-root.js` retains Polymer code for legacy testing purposes.
