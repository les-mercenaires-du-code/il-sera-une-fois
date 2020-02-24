import _ from 'lodash';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import { Router } from 'express';

// creates async functions for fs
Promise.promisifyAll(fs);

const defaultOptions = {
  baseDirectory: path.join(__dirname, 'apis'), // where to look for apis
};

/*
 ** createRoutes
 ** Register in express app all apis in a given folder
  */
export default async function routes(options) {


  const router = new Router();

  let routes;
  try {
    routes = await getRoutes(options);
    console.log('routes', routes);
  } catch (e) {
    console.log(e);
  }


  _.each(routes, (route) => {
    console.log('creating route', route);
    router[route.method](route.module.path, route.module.handler);
  });

  return (new Router()).use('/api', router);
}

async function getRoutes(options) {

  const opts = _.defaults(options, defaultOptions);
  const directories = await lsDir(opts.baseDirectory);

  const files = await Promise.map(directories, async(directory) => {
    const p = path.join(opts.baseDirectory, directory);

    const files = await fs.readdirAsync(p);

    return files.filter((name) => {
      return _.endsWith(name, '.action.js');
    }).map((filename) => {
      return path.join(directory, filename);
    });
  }).reduce((acc, actions) => {
    _.each(actions, (action) => {
      acc.push(action);
    });
    return acc;
  }, []);

  console.log('directories', directories);
  console.log('files', files);

  const routes = _.compact(_.map(files, (file) => {

    console.log(file);

    let module;
    try {
      console.log('trying to require:', `${path.join(opts.baseDirectory, file)}`);
      module = require(`${path.join(opts.baseDirectory, file)}`).default;
    } catch (e) {
      console.log(file, 'does not refer to an existing file');
    }

    if (!module || !module.path || !module.handler || !module.method) {
      return;
    }

    return {
      file,
      module,
      method: module.method,
    };
  }));

  return routes;
}


// return absolute path for all folder in base folder $from
async function lsDir(from) {

  try {
    const list = await fs.readdirAsync(from);
    const folders = await Promise.map(list, async(name) => {

      const check = path.join(from, name);
      const stat = await fs.lstatAsync(check);

      const isDir = stat.isDirectory();
      return isDir && name;
    });
    return _.compact(folders);

  } catch (e) {
    console.log(e);
  }

  return [];
}
