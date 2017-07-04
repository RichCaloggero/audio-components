## Accessibility
All controls are accessible via screen reader.
The audio player is simple and consists of a play button, a forward button, and a back button.
Play toggles between playing and paused states, and forward / back move ahead / back by 5 seconds, respectively.

Each component lives in its own region, introduced by a landmark and a heading.
Unfortunately these are the same, so arrowing through the interface produces some redundancy.
The heading level indicates how deeply nested in the component hierarchy the component is.

All numeric controls use html input controls with type set to "number".
On some machines, this does not work as expected with Firefox and NVDA.
If you attempt to use up / down arrow keys to adjust the value of the number and the focus jumps out of the field, you need to press NVDAKey+spacebar to force application mode before using arrows to adjust the value.
You can use normal text editing commands to change the value of the number as well, and this works on all machines tested.

Each component has a bypass checkbox just following its heading.
If it is checked, the component is removed from the signal flow, if unchecked the component is allowed to process the signal and you will hear the results.

## How to Test
There is a default music file already loaded and ready to go; just hit the play button.
All processing is turned off by default, so when first run, you should hear the original audio unchanged.
To hear a result, press play, and uncheck the bypass on the demo component itself (just after the player controls).
To hear the panner, use headphones and uncheck the bypass for the mono component and the panner component.
You should then hear a mono version of the original input moving in a circle around your head.
Uncheck the bypass on the "crosstalk cancelation" component and listen with speakers to see if you can hear the effect. It should make the 3d panning effect slightly more realistic via speakers.
It will degrade the experience when listening with headphones.

## Technical Details
### Crosstalk
Crosstalk refers to the interfeerence generated when your right ear hears a signal meant for your left ear, and your left ear hears a signal meant for the right ear. 
This happens when listening to a stereo signal through loudspeakers positioned in a standard stereo configuration.
The right ear mostly hears sound from the right speaker, but also picks up sound from the left speaker, however it is slightly delayed and filtered due to the difference in distance between your right ear and the two speakers.
(your right ear is very slightly closer to the right speaker).
Similarly for the left side -- it receives a slightly delayed and filtered signal from the right speaker as well as the more direct sound from the left speaker.

Crosstalk cancelation tries to eliminate this by feeding a slightly delayed, filtered,  and phase-inverted signal from the right channel into the left, and vice versa.
In this implementation, you can adjust the delay times, whether the phase is inverted, and the filter characteristics used for each channel.

Mid-side processing is similar, but it uses a different technique.
Here we turn a normal stereo signal into one whose left channel is the sum of both its inputs (basically a mono mix of the original stereo signal),
and whose right channel is the difference between the channels
(mathematically we just literally subtract the sample values for each channel from one another and feed them to the right output).
There are controls to adjust the level of each of these resultant signals which allows one to control the balance between mid and side.
We then reconstruct the original stereo signal, with level adjustments applied.

The crosstalk cancelation done here is simplistic and doesn't really work well, but useful to demo the webcomponents.
The mid-side processing network produces a similar result, again useful to demo these components and not much else.

### Automation
By default, the 3D panner is set to move an audio source in a circular path around the listener.
The source and listener have no specific orientation (you think of each source as a point source and the listener hears equally well in all directions).
The webaudio panner allows more control over how the source and listener are oriented, but it is not exposed via this component.

The panner is automated by a component called audio-control.
You can type in javascript which will be evaluated every 200 milliseconds (0.2 seconds).
The free variable should be "t" (no quotes) and represents time.
Mathematical functions from the standard javascript Math library are available but require the "Math" prefix (be sure the letter "M" in "Math" is uppercase).

The x coordinate represents left / right motion;
the y coordinate represents vertical motion;
the z coordinate represents motion towards / away from the listener.

If you leave a field blank, its automation will be turned off.
Leaving all fields blank turns off all automation.
You can also use the "enable automation" control to turn off automation.

## More Information
See comments in the HTML and the README which comes with this repository for more on this project and some tips on how to use the components to process audio.

## References

- [Project github repository](http://github.com/RichCaloggero/audio-components.git)
- [Crosstalk Cancelation](https://www.ideals.illinois.edu/bitstream/handle/2142/47443/ECE499-Fa2013-anushiravani.pdf?sequence=2)
- [Mid-side processing](http://www.masteringhouse.com/masteringtips/midside.html)