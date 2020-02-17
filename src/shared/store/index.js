import React from 'react';
import globalHook from '../utils/globalHook';

// define global store allowing to share collections across components
// Dot not abuse this...
const store = {};

// init a new collection given a type
const getCollection = (type, initialData) => {

  if (store[type]) {
    // if collection exists, return it
    return store[type]();
  }

  try {
    // try and require collection file (state and actions)
    const {state, actions} = require(`./${type}`).default;
    store[type] = globalHook(React, initialData || state, actions);

    // return collection
    return store[type]();
  } catch (e) {
    // return spreadable in case of error and log error
    console.error('could not find store file for type: ', type, e);
    return [];
  }
};

export default getCollection;
