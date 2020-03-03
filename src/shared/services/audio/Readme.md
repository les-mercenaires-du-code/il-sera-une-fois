## Audio

https://webaudio.github.io/web-audio-api/#AudioBufferSourceNode

better to have a single audio context with multiple nodes

### recording

- use MediaRecorder(context, options);

### Playing

- not quite sure yet but the doc for AudioBufferSourceNode states:

This interface represents an audio source from an in-memory audio asset in an AudioBuffer. It is useful for playing audio assets which require a high degree of scheduling flexibility and accuracy. If sample-accurate playback of network- or disk-backed assets is required, an implementer should use AudioWorkletNode to implement playback.
