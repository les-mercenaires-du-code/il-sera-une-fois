import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';

import _ from 'lodash';

import RoomInfo from './RoomInfo';

const Rooms = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div>
      <h2>Rooms available</h2>
      <ul>
        {_.map(props.state.roomsList, room =>
          <li key={room.id}>
            <RoomInfo {...props} state={room}/>
          </li>
        )}
      </ul>
    </div>
  )
};

export default Rooms;
