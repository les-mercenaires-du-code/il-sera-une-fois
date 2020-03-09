import React, { useState, useEffect } from 'react';
// import WSClient from '../services/WSClient';
// import Audio from '../services/Audio';
import Audio from '../services/audio/';

let webSocketClient, audio;
let init = false;

const GrandChild = (props) => {
  //

  const [players, setPlayers] = useState([]);


  useEffect(() => {

    (async function doAsync() {

      if (init) {
        return;
      }

      init = true;
      const roomId = 0;
      audio = new Audio(setPlayers);
      await audio.init(roomId);

    })();

    return() => Promise.all([
      audio.stop(),
    ]).then(() => {
      init = false;
    });
  }, []);


  if (!init) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div>
      <h3>Grand Childrend</h3>
      {
        _.map(audio._players._ids, (player, id) => {
          return (
            <div key={id}>
              <h3>user: {player} is in the room</h3>
            </div>
          );
        })
      }

      {audio && audio.recorder && audio.recorder.ready ? <p>recording...</p> : <p>'not recording</p>}
      <button
        disable={audio && audio.recorder && audio.recorder.ready} type="button" onClick={() => audio.startRecorder()}>Start recorder</button>
      <button
        disable={audio && audio.recorder && !audio.recorder.ready}
        type="button" onClick={() => audio.stopRecorder()}>Stop recorder</button>
      <button type="button" onClick={() => audio.startPlayers()}>Start player</button>
      <button type="button" onClick={() => audio.stopPlayers()}>Stop player</button>

    </div>
  );
};

export default GrandChild;
