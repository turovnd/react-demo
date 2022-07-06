import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Search, AUTO_LOCALIZE_KEYS } from '@demo/search';

const SearchField = ({ setFilter }) => {
  const { projectId } = useParams();

  return (
    <Search
      onChange={setFilter}
      request={{
        service: 'works-service',
        path: '/resources/search/filters',
        params: { projectId },
      }}
      projectId={projectId}
      autoLocalize={[AUTO_LOCALIZE_KEYS.model, AUTO_LOCALIZE_KEYS.type, AUTO_LOCALIZE_KEYS.section]}
    />
  );
};

SearchField.propTypes = {
  setFilter: PropTypes.func.isRequired,
};

export { SearchField };
