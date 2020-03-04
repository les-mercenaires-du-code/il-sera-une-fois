## Audio

https://webaudio.github.io/web-audio-api/#AudioBufferSourceNode

better to have a single audio context with multiple nodes

### recording

- use MediaRecorder(context, options);

### Playing

- not quite sure yet but the doc for AudioBufferSourceNode states:

This interface represents an audio source from an in-memory audio asset in an AudioBuffer. It is useful for playing audio assets which require a high degree of scheduling flexibility and accuracy. If sample-accurate playback of network- or disk-backed assets is required, an implementer should use AudioWorkletNode to implement playback.

### links

https://fr.wikipedia.org/wiki/Modulation_d%27impulsion_cod%C3%A9e
getting familiar with pcm data

https://github.com/mattdiamond/Recorderjs
out of date but has some nice ideas for exporting to wave

https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode
example of using media recorder
not using this right now since i did not find a way to force blob size!

https://stackoverflow.com/questions/40363335/how-to-create-an-audiobuffer-from-a-blob
get array buffer from blob

https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a
build audio processor

https://dvcs.w3.org/hg/audio/raw-file/tip/streams/StreamProcessing.html
media stream doc

https://github.com/guest271314/MediaFragmentRecorder/blob/master/MediaFragmentRecorder.html

https://webrtc.github.io/samples/src/content/getusermedia/record/
media recorder example

https://drafts.css-houdini.org/worklets/#dom-worklet-addmodule
worklet doc

https://www.w3.org/TR/worklets-1/
official worklet doc

https://webaudio.github.io/web-audio-api/#AudioBufferSourceNode
web audio api doc

https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#Audio_channels
concept behind audio api

https://www.html5rocks.com/en/tutorials/webaudio/intro/
out of date but has a couple of nice ideas

https://github.com/GoogleChromeLabs/web-audio-samples
GOOD examples
shared buffer is not wildy supported...

https://developers.google.com/web/updates/2018/06/audio-worklet-design-pattern
worklet design pattern

https://developers.google.com/web/updates/2017/12/audio-worklet
audio worklet basics

// https://webaudio.github.io/web-audio-api/#audioworklet
