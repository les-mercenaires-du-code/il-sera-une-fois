// https://github.com/mdn/webaudio-examples
// https://exploringjs.com/impatient-js/ch_typed-arrays.html
// https://stackoverflow.com/questions/50512436/how-to-convert-arraybuffer-to-audiobuffer
// https://apiko.com/blog/audio-file-streaming-in-js/
class Audio {
  constructor(ws) {

    this.ws = ws;

    this.bufferSize = 2048;
    this.constraints = {
    	audio: true,
    	video: false
    };
    this.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.globalStream = null;

    this.context = null;
    this.input = null;
    this.processor = null;

    this.record = this.record.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }


  record() {

    this.ws.send('startRecording');

    this.context = new this.AudioContext({
      // https:// developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
      latencyHint: 'interactive',
    });

    this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);
  	this.processor.connect(this.context.destination);
  	this.context.resume();

    const handleSuccess = (stream) => {
      console.log('handleSuccess');

      this.globalStream = stream;
  		this.input = this.context.createMediaStreamSource(stream);
  		this.input.connect(this.processor);

  		this.processor.onaudioprocess = (e) => {
  			this.processMic(e);
  		};
  	};

    navigator
      .mediaDevices
      .getUserMedia({ audio: { echoCancellation: true } })
      .then((stream) => handleSuccess(stream))
    ;
  }

  stopRecording() {

    this.ws.send('stopRecording');

    this.input.disconnect(this.processor);
    this.processor.disconnect(this.context.destination);
    return this.context.close()
      .then(() => {
      this.input = null;
      this.processor = null;
      this.context = null;
      console.log('recording stopped');
    });

  }

  processMic(event) {
    // extract float32Array from audioBuffer
    var ab = event.inputBuffer.getChannelData(0);
    // send arrayBuffer from float32Array
    this.ws.send('binary', ab.buffer);
  }

}

export default Audio;

// https://github.com/Ivan-Feofanov/ws-audio-api/blob/master/src/ws-audio-api.js
// https://stackoverflow.com/questions/40118921/understanding-audiobuffer-to-arraybuffer-conversion

// https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground/blob/master/src/public/js/client.js
