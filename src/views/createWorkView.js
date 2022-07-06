import React from 'react';
import { Provider } from 'react-redux';

import store from '../redux/store';
import { WorkDetails } from '../components/WorkDetails';

export default () => (
  <Provider store={store}>
    <WorkDetails isCreating />
  </Provider>
);
