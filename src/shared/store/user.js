import _ from 'lodash';

const defaultState = {
  authenticated: false,
  name: '',
};

const actions = {
  login: (store, cb) => {

    if (store.state.authenticated) {
      return;
    }

    const authenticated = true;
    const name = 'tommy';
    store.setState({ authenticated, name });

    if (!_.isFunction(cb)) {
      return;
    }

    cb();

  },
  logout: (store) => {

    if (!store.state.authenticated) {
      return;
    }

    const authenticated = false;
    const name = '';
    store.setState({ authenticated, name });
  },
};

export default {
  state: defaultState,
  actions,
};
