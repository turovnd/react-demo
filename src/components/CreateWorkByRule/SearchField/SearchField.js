import React from 'react';
import PropTypes from 'prop-types';
import { Search } from '@demo/search';

const SearchField = ({ setFilter }) => (
  <Search
    onChange={setFilter}
    request={{
      service: 'elements-service',
      path: '/elements/aggregations/by-organization/filters',
    }}
  />
);

SearchField.propTypes = {
  setFilter: PropTypes.func.isRequired,
};

export { SearchField };
