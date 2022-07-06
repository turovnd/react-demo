import React from 'react';
import { Provider } from 'react-redux';

import store from '../redux/store';
import { WorksList } from '../components/WorksList';

export default () => (
  <Provider store={store}>
    <WorksList />
  </Provider>
);
