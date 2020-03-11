import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";


const Child = (props) => {

  // if (!props.state) {
  //   return (
  //     <p>loading</p>
  //   );
  // }
  // <p>{props.user.name}</p>
  // <p>{props.state.test}</p>

  return (
    <div>

      <h2>Child</h2>
      {/* child routes won't render without this */}
      {renderRoutes(props.route.routes, { someProp: "these extra props are optional" })}
    </div>
  )
};

export default Child;
