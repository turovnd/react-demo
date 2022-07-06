import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useIntl } from '@demo/localization';
import { Breadcrumbs, Container, ContainerTitle } from '@demo/bricks';
import { ROUTE_NAMES } from '@demo/registry-ui/constants';
import { MicroFrontend } from '@demo/registry-ui';
import { catalogs } from '@demo/registry-ui/applications';
import { useNavigator } from '@demo/registry-ui/utils';
import AutoSizer from 'react-virtualized-auto-sizer';

import { messages } from '../../../localization';
import { workDetailsActions, workDetailsSelectors } from '../../../redux/slices';
import { useStyles } from '../WorkDetails.styles';
import { MicrofrontendLoader } from '../../MicrofrontendLoader';

const AddResByCatalog = ({ isCreating }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const { formatMessage } = useIntl();
  const { projectId } = useParams();

  const initialResType = useSelector(workDetailsSelectors.selectInitialAddByCatalogResType);
  const storeResources = useSelector(workDetailsSelectors.selectCatalogSourceResources);

  const [selection, setSelection] = useState(storeResources.map(r => ({ ...r, _id: r.resId })));

  const handleClose = () => {
    dispatch(workDetailsActions.setIsAddByCatalogOpen.base({ isOpen: false }));
  };

  const handleSubmit = () => {
    dispatch(workDetailsActions.addWorkResourcesByCatalog.base({ resources: selection }));
    handleClose();
  };

  return (
    <div className={classes.root}>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={formatMessage(messages['workDetails.resources.addByCatalog.title'])}
        subtitle={
          <Breadcrumbs
            items={[
              {
                label: formatMessage(messages['worksList.title']),
                onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
              },
              {
                label: formatMessage(messages[isCreating ? 'workDetails.titleCreate' : 'workDetails.title']),
                onClick: handleClose,
              },
            ]}
          />
        }
        actions={[
          {
            label: formatMessage(messages['button.cancel']),
            onClick: handleClose,
          },
          {
            label: formatMessage(messages['button.save']),
            variant: 'contained',
            color: 'primary',
            onClick: handleSubmit,
            disabled: selection.length === 0,
          },
        ]}
      />

      <Container paddingH="small">
        <MicroFrontend
          id={catalogs.id}
          routePath={catalogs.fragments.resourcesSelectionSearch}
          initialResType={initialResType}
          LoadingComponent={() => <MicrofrontendLoader type="search" />}
        />
      </Container>

      <div className={classes.flexTable}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <MicroFrontend
              id={catalogs.id}
              routePath={catalogs.fragments.resourcesSelection}
              LoadingComponent={() => <MicrofrontendLoader height={height} type="table" />}
              height={height}
              selection={selection.map(res => res._id)}
              onSelect={res => {
                const alreadySelected = selection.find(r => r._id === res._id);
                setSelection(alreadySelected ? selection.filter(r => r._id !== res._id) : [...selection, res]);
              }}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

AddResByCatalog.propTypes = {
  isCreating: PropTypes.bool,
};

AddResByCatalog.defaultProps = {
  isCreating: false,
};

export { AddResByCatalog };
