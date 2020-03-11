import _ from 'lodash';

import BufferLoader from './BufferLoader';

class Mic {

  constructor(ws) {

    this.ws = ws;
    this.BUFF_SIZE = 16348;
    this.audioInput = null;
    this.microphoneStream = null;
    this.gainNode = null;
    this.scriptProcessorNode = null;
    this.scriptProcessorFttNode = null;
    this.analyserNode = null;

    if (!navigator || !window || !AudioContext) {
      throw new Error('server side ?')
      return;
    }

    this.AudioContext = window.AudioContext || window.webkitAudioContext;

    this.handleSuccess = this.handleSuccess.bind(this);
    this.finishedLoading = this.finishedLoading.bind(this);
    this.start = this.start.bind(this);
  }

  createSoundWithBuffer( buffer ) {

    /*
      This audio context is unprefixed!
    */
    var context = new AudioContext();

    var audioSource = context.createBufferSource();
    audioSource.connect( context.destination );

    context.decodeAudioData( buffer, function( res ) {

      audioSource.buffer = res;

      /*
         Do something with the sound, for instance, play it.
         Watch out: all the sounds will sound at the same time!
      */
        audioSource.noteOn( 0 );

    } );

  }


  async start() {

    // this.audioCtx = new this.AudioContext();
    // this.getUserMedia = navigator.getUserMedia ||
    //   navigator.webkitGetUserMedia ||
    //   navigator.mozGetUserMedia ||
    //   navigator.msGetUserMedia ||
    //   navigator.webkitGetUserMedia
    // ;
    //
    // const bufferLoader = new BufferLoader(
    //   this.audioCtx,
    //   [
    //     '/t.wav',
    //   ],
    //   this.finishedLoading
    //   );
    //
    // bufferLoader.load();



// let audioDefaultConstraintString = '{\n  "sampleSize": 16,\n  "channelCount": 2,\n  "echoCancellation": true\n}'

    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } })
        .then(this.handleSuccess);

  }

  handleSuccess(stream) {
    // if (window.URL) {
    //   player.srcObject = stream;
    // } else {

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);

    setTimeout(() => {
      context.close();
    }, 5000)

    source.connect(processor);
    processor.connect(context.destination);

    const ws = this.ws;
    processor.onaudioprocess = function(e) {
      // Do something with the data, e.g. convert it to WAV
      // console.log(e.inputBuffer);

      ws.send({
        audioBuffer: e.inputBuffer,
        roomId: 1,
      })

      // var source = context.createBufferSource(); // creates a sound source
      // source.buffer = e.inputBuffer;                    // tell the source which sound to play
      // source.connect(context.destination);       // connect the source to the context's destination (the speakers)
      // source.start(0);                           // play the source now

    };
      // player.src = stream;
    // }
  }

  // loadSong(url) {
  //   var request = new XMLHttpRequest();
  //   request.open('GET', url, true);
  //   request.responseType = 'arraybuffer';
  //
  //   // Decode asynchronously
  //   request.onload = function() {
  //     context.decodeAudioData(request.response, function(buffer) {
  //       dogBarkingBuffer = buffer;
  //     }, onError);
  //   }
  //   request.send();
  //
  // }
  //
  // playSound(buffer, time = 0) {
  //   var source = context.createBufferSource(); // creates a sound source
  //   source.buffer = buffer;                    // tell the source which sound to play
  //   source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  //   source.start(time);                           // play the source now
  //   // note: on older systems, may have to use deprecated noteOn(time);
  //
  // }

  // init() {
  //   // Fix up prefixing
  //   window.AudioContext = window.AudioContext || window.webkitAudioContext;
  //   context = new AudioContext();
  //
  //   bufferLoader = new BufferLoader(
  //     context,
  //     [
  //       './t.wav',
  //     ],
  //     finishedLoading
  //     );
  //
  //   bufferLoader.load();
  // }

  finishedLoading(bufferList) {

    console.log(bufferList);

    const source1 = this.audioCtx.createBufferSource();
    // Create two sources and play them both together.
    // var source2 = context.createBufferSource();
    source1.buffer = bufferList[0];
    // source2.buffer = bufferList[1];
    //
    source1.connect(this.audioCtx.destination);
    // source2.connect(context.destination);
    source1.start(0);
    // source2.start(0);
    //
  }

}

export default Mic;
