import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Search, AUTO_LOCALIZE_KEYS } from '@demo/search';
import { MicroFrontend } from '@demo/registry-ui';
import { costsUi } from '@demo/registry-ui/applications';

import { costsCommonActions, costsCommonSelectors } from '../../../../../redux/slices';
import { MicrofrontendLoader } from '../../../../MicrofrontendLoader';

const SearchField = () => {
  const dispatch = useDispatch();
  const searchRef = useRef();
  const { projectId } = useParams();

  const tab = useSelector(costsCommonSelectors.selectTab);
  const cost = useSelector(costsCommonSelectors.selectCost);

  // Clear filters on tab change.
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.removeAll();
    }
  }, [tab, cost]);

  if (cost) {
    return (
      <MicroFrontend
        id={costsUi.id}
        routePath={costsUi.fragments.costsSelectionSearch}
        LoadingComponent={() => <MicrofrontendLoader type="search" />}
        projectId={projectId}
        costId={cost._id}
      />
    );
  }

  return (
    <Search
      ref={searchRef}
      onChange={newFilters => dispatch(costsCommonActions.setFilters.base({ filters: newFilters }))}
      request={{
        service: 'costs-service',
        path: `/costs/filters`,
        params: { projectId },
      }}
      projectId={projectId}
      autoLocalize={[AUTO_LOCALIZE_KEYS.model, AUTO_LOCALIZE_KEYS.workType]}
    />
  );
};

export { SearchField };
