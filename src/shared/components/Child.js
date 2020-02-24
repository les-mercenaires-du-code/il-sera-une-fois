import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";

import Room from './Room';

const Child = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div>

      <Room />

      <h2>Child</h2>
      <p>{props.user.name}</p>
      <p>{props.state.test}</p>
      {/* child routes won't render without this */}
      {renderRoutes(props.route.routes, { someProp: "these extra props are optional" })}
    </div>
  )
};

export default Child;
