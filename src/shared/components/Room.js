import React, { useState, useEffect } from 'react';

import WSClient from '../services/WSClient';
import Audio from '../services/Audio';

// import Microphone from '../microphone';
// const WebSocket = require('isomorphic-ws');


const wsc = new WSClient('ws://localhost:3000');

const Room = (props) => {

  // use effect will only run when cmp is mounted => will not be loaded server side

  let audio;
  useEffect(() => {

    (async function doAsync() {
      // ws.binaryType = "arraybuffer";

      await wsc.start();
      wsc.send('join', 0)
      audio = new Audio(wsc);
    })()
  }); // make sure it runs only once

  const start = () => {
    audio.record();
  }

  const stop = () => {
    audio.stopRecording();
  }

  return (
    <div>
      <button type="button" onClick={() => audio.record()}>Start</button>
      <button type="button" onClick={() => audio.stopRecording()}>Stop</button>
    </div>
  )
}

export default Room;

//
// useEffect(() => {
//
//   const ws = new WebSocket('ws://localhost:3000');
//
//   ws.onopen = function open() {
//     console.log('connected');
//     ws.send(Date.now());
//   };
//
//   ws.onclose = function close() {
//     console.log('disconnected');
//   };
//
//   ws.onmessage = function incoming(data) {
//     console.log(`Roundtrip time: ${Date.now() - data.data} ms`);
//
//     setTimeout(function timeout() {
//       ws.send(Date.now());
//     }, 500);
//   };
//   const mic = new Microphone(ws);
//   async function doAsync() {
//     await mic.start();
//   }
//
//   // no need to wait here
//   doAsync();
// }, [null])
//
