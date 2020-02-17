import React from 'react';
import _ from 'lodash';

const Login = (props) => {

  let from = _.get(props, 'location.state.from', null);
  from = from && <p>You need to log in to access route: {from.pathname}</p>;

  const fakeLogin = (e) => {

    const { from } = props.location.state || { from: { pathname: '/' } };
    return props.userActions.login(() => {
      props.history.replace(from);
    });
  }

  const logOut = (e) => {
    return props.userActions.logout();
  }


  return (
    <div>
      {from}
      <p>Login page</p>
      <p>username: {props.user.name || 'not logged yet'}</p>
      <button type="button" onClick={fakeLogin}>log in</button>
      <button type="button" onClick={logOut}>log out</button>
    </div>
  );
}

export default Login;
