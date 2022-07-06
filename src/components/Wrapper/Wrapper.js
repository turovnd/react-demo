import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { orgRulesActions, worksListActions, wrapperActions } from '../../redux/slices';
import { Filters } from './Filters';

const Wrapper = () => {
  const dispatch = useDispatch();
  useEffect(
    () => () => {
      dispatch(worksListActions.devitalize.base());
      dispatch(orgRulesActions.devitalize.base());
      dispatch(wrapperActions.devitalize.base());
    },
    []
  );

  return <Filters />;
};

export { Wrapper };
