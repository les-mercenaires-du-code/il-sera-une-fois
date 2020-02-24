import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";
import { NavLink } from 'react-router-dom';

const RoomInfo = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }

  console.log(props.state.users);
  console.log('props', props);

  return (
    <div>
      <NavLink
        exact={true}
        to={`/room/${props.state.id}`}
      >
        {props.state.name}
      </NavLink>

      <h2>{props.state.users.length} players connected</h2>
    </div>
  )
};

export default RoomInfo;
