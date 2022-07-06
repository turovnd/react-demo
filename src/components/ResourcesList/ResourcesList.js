import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useIntl } from '@demo/localization';
import { Container, ContainerTitle } from '@demo/bricks';

import { DefaultTheme, useModuleSize } from '@demo/theming';
import { ResourcesTable } from './ResourcesTable';
import { SearchField } from './SearchField';
import { messages } from '../../localization';
import { resourcesListActions } from '../../redux/slices';
import { ElementsExpandPanel } from '../common/ElementsExpandPanel';
import { useDeepEffect } from '../../utils/useDeepEffect';

const ResourcesList = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { projectId } = useParams();
  const { height } = useModuleSize();

  const [filters, setFilters] = useState([]);
  const [modelElements, setModelElements] = useState([]);
  const [expandHeight, setExpandHeight] = useState(400);
  const [expanded, setExpanded] = useState(false);

  const tableHeight =
    height -
    // ContainerTitle.
    DefaultTheme.spacing(14) -
    // Search field.
    DefaultTheme.spacing(10) -
    // Expand height
    expandHeight;

  // Search new rows only once on params updated.
  useDeepEffect(() => {
    dispatch(
      resourcesListActions.searchRows.base({
        elements: modelElements,
        projectId,
        filters,
        reset: true,
      })
    );
  }, [filters, modelElements]);

  const setStateModelElements = entries => {
    const elements = Object.values(entries).reduce((acc, revitIdsArray) => acc.concat(revitIdsArray), []);
    setModelElements(elements);
  };

  return (
    <div>
      <ContainerTitle tag="h1" padding="small" title={formatMessage(messages['resourcesList.title'])} />

      <Container paddingH="small">
        <SearchField setFilter={setFilters} />
      </Container>

      <ResourcesTable height={tableHeight} elements={modelElements} filters={filters} />

      <ElementsExpandPanel
        isExpanded={expanded}
        setIsExpanded={setExpanded}
        setExpandHeight={setExpandHeight}
        onSelect={elements => setStateModelElements(elements)}
      />
    </div>
  );
};

export { ResourcesList };
