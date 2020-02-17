import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { hydrate } from 'react-dom';
import { loadableReady } from '@loadable/component';
import { renderRoutes } from "react-router-config";

import routes from '../shared/routes';
import './scss/index.scss';


const main = () => {
  hydrate(
    <BrowserRouter>
      {renderRoutes(routes)}
    </BrowserRouter>,
    document.getElementById('app')
  );
}

loadableReady((props) => {

  main();

  if (module.hot) {

    console.log('module is hot');
    module.hot.accept('../shared/routes', () => {
      main();
    });
  }

});
