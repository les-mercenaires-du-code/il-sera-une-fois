import Promise from 'bluebird';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';

const DataProvider = (props) => {

  if (!props.route.loadData) {
    return props.children;
  }

  const staticData = __isBrowser__ ?
    (__isBrowser__ && window.__STATIC_DATA__) :
    props.staticContext.staticData
  ;

  const data = _.reduce(staticData, (acc, data) => {

    if (data.url === props.match.url) {
      acc = data.data;
    }

    return acc;
  }, null);

  if (!_.isNull(data)) {
    const [state, setState] = useState(data);
    return React.cloneElement(props.children, { state, ...props });
  }

  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const fetchData = Promise.method(props.route.loadData);

  let cancelled = false;
  useEffect(() => {
    fetchData()
      .catch((err) => {

        if (cancelled) {
          return;
        }
        console.log(err);
        setError(err);
      })
      .then((res) => {

        // react will throw if we try to update a component that has been destroyed
        if (cancelled) {
          return;
        }
        setState(res);
      })
    ;

    return () => {
      cancelled = true;
    };
  }, [null]); // pass [null] to never fire effect again
  // later on, this might need some more consideration to handle socket updates

  return React.cloneElement(props.children, { state, error, ...props });
}

export default DataProvider;
