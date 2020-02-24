import _ from 'lodash';
import ws from 'socket.io-client';

import AudioQueue from './AudioQueue';

class WSClient {
  constructor(options) {

    this.uri = _.isString(options) ?
      options :
      options.uri
    ;

    if (!_.isString(this.uri)) {
      throw new Error('Uri is required to build construct WebSocket');
    }


    this.open = false;
    this.close = false;

    this.send = this.send.bind(this);

    this.audioQueue = new AudioQueue();
    console.log('this.audioQueue', this.audioQueue);
  }

  async start() {

    console.log('starting');
    this.socket = ws.connect(this.uri);


    this.socket.on('ret', (data) => {
      const audio = new Float32Array(data);
      // console.log('audio ws', audio);
      this.audioQueue.write(audio);
    });
  }


  send(type, data) {

    console.log('trying to send data', type, data);
    this.socket.emit(type, data)
  }
}

export default WSClient;

//
// const float32 = new Float32Array(data);
// const AudioContext = window.AudioContext || window.webkitAudioContext;
// const context = new AudioContext({
//   // https:// developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
//   latencyHint: 'interactive',
// });
//
// var audioSource = context.createBufferSource();
// audioSource.connect( context.destination );
//
// console.log(float32);
// context.decodeAudioData(float32.buffer, function( res ) {
//
//   audioSource.buffer = res;
//
//   /*
//      Do something with the sound, for instance, play it.
//      Watch out: all the sounds will sound at the same time!
//   */
//     audioSource.noteOn( 0 );
//
// });
//
