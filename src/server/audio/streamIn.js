import _ from 'lodash';


class streamIn {
  constructor(options = {}) {

    if (!_.isObject(options) || !options.ws) {
      console.error('options should be an object');
      console.error('options.ws must be defined');
      throw new Error('[Audio.streamIn] Invalid constructor options');
    }

    this.ws = ws;
  }
}


export default streamIn;
