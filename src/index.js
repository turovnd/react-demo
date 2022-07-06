import 'babel-polyfill';
import Loadable from 'react-loadable';

import './redux/store'; // initiates adding store to global store
import map from './viewMap';

export const makeAsyncView = viewName =>
  Loadable({
    loader: () => import(/* webpackChunkName: 'view-[request]' */ `./views/${viewName}`),
    loading: () => null,
  });

export default Object.keys(map).reduce(
  (result, route) => ({
    ...result,
    [route]: makeAsyncView(map[route]),
  }),
  {}
);
