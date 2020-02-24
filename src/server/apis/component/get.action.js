import path from 'path';
import listComponents from './listComponents';
import Collapsible from '../../../shared/components/Collapsible';


const logPropTypes = ({propTypes}) => Object.keys(propTypes).forEach(key => console.log({
    key,
    ...propTypes[key].info
}));

const route = {
  method: 'get',
  path: '/component',
  async handler(req, res, next) {
    console.log('handler for', route.path);

    console.log('-----------------');

    // log the propType data
    logPropTypes(Collapsible);

    console.log('-----------------');

    const root = process.env.NODE === 'production' ?
      '../../client' :
      '../../../shared/components'
    ;

    const comps = await listComponents(path.join(__dirname, root));
    console.log(comps);
    res.json(comps);
  },
};

export default route;
