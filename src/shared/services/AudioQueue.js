class AudioQueue {
  constructor() {

    this.buffer = new Float32Array(0);
    this.silence = new Float32Array(2048);

    this.write = this.write.bind(this)
    this.read = this.read.bind(this)


    this.context = new AudioContext();
    this.scriptNode = this.context.createScriptProcessor(2048, 1, 1);
    this.scriptNode.onaudioprocess = (e) => {

      if (this.buffer.length) {
        const read = this.read(2048);
        console.log('read', read);
        e.outputBuffer.getChannelData(0).set(read);
        return;
      }

      e.outputBuffer.getChannelData(0).set(this.silence);

      // e.outputBuffer.getChannelData(0).set(_this.audioQueue.read(_this.config.codec.bufferSize));

    }
    this.gainNode = this.context.createGain();
    this.scriptNode.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

  }

  // concat current buffer with new buffer
  write(audio) {

    if (typeof audio === 'number') {
      return;
    }

    const currentQLen = this.buffer.length;
    const newQLen = currentQLen + audio.length;

    console.log('audio', audio);
    console.log('currentQLen', currentQLen);
    console.log('newQLen', newQLen);
    console.log('audio.length', audio.length);

    const newBuffer = new Float32Array(newQLen);
    newBuffer.set(this.buffer, 0);
    newBuffer.set(audio, currentQLen);

    this.buffer = newBuffer;
  }

  // extract buffer size from current buffer
  read(bufferSize) {

    console.log('------------', bufferSize);
    const buffer = this.buffer.subarray(0, bufferSize);
    this.buffer = this.buffer.subarray(bufferSize, this.buffer.length);

    return buffer;
  }

}

export default AudioQueue;
