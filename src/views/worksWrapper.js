import React from 'react';
import { Provider } from 'react-redux';

import store from '../redux/store';
import { Wrapper } from '../components/Wrapper';

export default () => (
  <Provider store={store}>
    <Wrapper />
  </Provider>
);
