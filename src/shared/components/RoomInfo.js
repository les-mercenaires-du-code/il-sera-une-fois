import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";

const RoomInfo = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }

  console.log(props.state.users);
  

  return (
    <div>
      <h2>{props.state.name}</h2>
      <h2>{props.state.users.length} players connected</h2>
    </div>
  )
};

export default RoomInfo;
