import React from 'react';
import { Provider } from 'react-redux';

import store from '../redux/store';
import { ResourcesList } from '../components/ResourcesList';

export default () => (
  <Provider store={store}>
    <ResourcesList />
  </Provider>
);
