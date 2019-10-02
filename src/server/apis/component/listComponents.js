import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';

Promise.promisifyAll(fs);

async function listComponents(root) {

  try {
    const components = await fs.readdirAsync(root);
    const cleanComponents = components.map((name) => {

      console.log('->', name);
      if (_.endsWith(name, '.js')) {
        return name.substring(0, name.length - 3);
      }

      return name;
    });

    return cleanComponents;
  } catch (e) {
    console.log('listComponents error', e);
  }

  return [];

    // .filter((file) => file.match(/.*\.js$/))
    // .map((file) => {
    //   return {
    //     name: file.substring(0, file.length - 3),
    //     path: path.join(__dirname, root, file),
    //   };
    // })
    // .reduce((entries, file) => {
    //     entries[file.name] = file.path;
    //     return entries;
    // }, {})

}

export default listComponents;
