import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";


const Room = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div>
      <h2>{props.state.name}</h2>
      <h2>{props.state.users.length} players connected</h2>
    </div>
  )
};

export default Room;
