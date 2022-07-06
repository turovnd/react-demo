import React from 'react';
import { Provider } from 'react-redux';

import store from '../redux/store';
import { CreateWorkByRule } from '../components/CreateWorkByRule';

export default () => (
  <Provider store={store}>
    <CreateWorkByRule />
  </Provider>
);
