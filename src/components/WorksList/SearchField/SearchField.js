import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Search, AUTO_LOCALIZE_KEYS } from '@demo/search';
import { worksListActions, worksListSelectors } from '../../../redux/slices';

const SearchField = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const filters = useSelector(worksListSelectors.selectFilters);

  const handleChange = f => {
    dispatch(worksListActions.setFilters.base(f));
  };

  return (
    <Search
      onChange={handleChange}
      initialValue={filters}
      request={{
        service: 'works-service',
        path: '/works/search/filters',
        params: { projectId },
      }}
      projectId={projectId}
      autoLocalize={[AUTO_LOCALIZE_KEYS.model, AUTO_LOCALIZE_KEYS.section]}
    />
  );
};

export { SearchField };
