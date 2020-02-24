import _ from 'lodash';


class streamOut {
  constructor(options = {}) {

    if (!_.isObject(options) || !options.ws) {
      console.error('options should be an object');
      console.error('options.ws must be defined');
      throw new Error('[Audio.streamOut] Invalid constructor options');
    }

    this.ws = ws;
  }
}


export default streamOut;
