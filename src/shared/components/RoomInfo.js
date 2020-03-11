import { NavLink } from 'react-router-dom';

function RoomInfo({ state }) {

  if (!state) {
    return (
      <p>loading</p>
    );
  }

  const joinRoom = () => {
    return
  }

  return (
    <div>
      <h2>{state.name}</h2>
      <h2>{state.nbUsersConnected} players connected</h2>
      <NavLink
        exact={true}
        to={`/room/${state.id}`}
      >
      Join room
      </NavLink>
    </div>
  )
};

export default RoomInfo;
