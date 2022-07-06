import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs, Container, ContainerTitle } from '@demo/bricks';
import { useParams } from 'react-router-dom';
import { ROUTE_NAMES } from '@demo/registry-ui';
import { useFormatMessage } from '@demo/localization';
import { useNavigator } from '@demo/registry-ui/utils';

import { addWorkByRuleActions, addWorkByRuleSelectors } from '../../redux/slices';
import { SearchField } from './SearchField';
import { WorksTable } from './WorksTable';
import { messages } from '../../localization';

const CreateWorkByRule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const { projectId } = useParams();
  const msg = useFormatMessage(messages);

  const isAdding = useSelector(addWorkByRuleSelectors.selectIsAdding);
  const selectedWorks = useSelector(addWorkByRuleSelectors.selectSelectedWorks);

  const [filter, setFilter] = useState([]);

  useEffect(
    () => () => {
      dispatch(addWorkByRuleActions.devitalize.base());
    },
    []
  );

  const handleSubmit = () => {
    dispatch(
      addWorkByRuleActions.submitWorks.base({
        projectId,
        successMessage: msg('notifications.addWorkByRule.submit'),
        onSuccess: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
      })
    );
  };

  return (
    <div>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={msg('createWorkByRule.title')}
        subtitle={
          <Breadcrumbs
            items={[
              {
                label: msg('worksList.title'),
                onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
              },
            ]}
          />
        }
        actions={[
          {
            label: msg('button.cancel'),
            onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
          },
          {
            label: msg('button.create'),
            variant: 'contained',
            color: 'primary',
            disabled: selectedWorks.length === 0,
            onClick: handleSubmit,
            loading: isAdding,
          },
        ]}
      />

      <Container paddingH="small">
        <SearchField setFilter={setFilter} />
      </Container>

      <WorksTable filter={filter} />
    </div>
  );
};

export { CreateWorkByRule };
