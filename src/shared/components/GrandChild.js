const GrandChild = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }


  return (
    <div>
      <h3>Grand Childrend</h3>
      <button type="button" onClick={() => audio.startRecorder()}>Start recorder</button>
      <button type="button" onClick={() => audio.stopRecorder()}>Stop recorder</button>
      <button type="button" onClick={() => audio.startPlayers()}>Start player</button>
      <button type="button" onClick={() => audio.stopPlayers()}>Stop player</button>

    </div>
  );
};

export default GrandChild;
