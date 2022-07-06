import { Breadcrumbs, Container, ContainerTitle } from '@demo/bricks';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { ROUTE_NAMES, MicroFrontend } from '@demo/registry-ui';
import { specification } from '@demo/registry-ui/applications';
import { useIntl } from '@demo/localization';
import { useParams } from 'react-router-dom';
import { useNavigator } from '@demo/registry-ui/utils';
import AutoSizer from 'react-virtualized-auto-sizer';
import { addResBySpecificationActions, workDetailsActions, workDetailsSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';
import { ElementsExpandPanel } from '../../common/ElementsExpandPanel';
import { useStyles } from '../WorkDetails.styles';
import { MicrofrontendLoader } from '../../MicrofrontendLoader';

const AddResBySpecification = ({ isCreating }) => {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const { projectId } = useParams();

  const storeResources = useSelector(workDetailsSelectors.selectSpecificationSourceResources);

  const [selection, setSelection] = useState(storeResources || []);
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState(false);

  const handleClose = () => {
    dispatch(addResBySpecificationActions.setIsOpen.base(false));
  };

  const handleSubmit = () => {
    dispatch(workDetailsActions.addWorkResourcesBySpecification.base({ projectId, resources: selection }));
    handleClose();
  };

  return (
    <div className={classes.root}>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={formatMessage(messages['workDetails.resources.addBySpecification.title'])}
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
          id={specification.id}
          routePath={specification.fragments.specificationTableSearch}
          LoadingComponent={() => <MicrofrontendLoader type="search" />}
        />
      </Container>

      <div className={classes.flexTable}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <MicroFrontend
              id={specification.id}
              routePath={specification.fragments.specificationTable}
              LoadingComponent={() => <MicrofrontendLoader height={height} type="table" />}
              selectable
              height={height}
              projectId={projectId}
              selection={selection.map(elem => ((elem || {}).details || {}).specificationId || elem._id)}
              onClick={specPosition => setSelected(selected._id === specPosition._id ? {} : specPosition)}
              onSelect={resource =>
                setSelection(
                  selection.find(r => ((r.details || {}).specificationId || r._id) === resource._id) !== undefined
                    ? [...selection.filter(r => ((r.details || {}).specificationId || r._id) !== resource._id)]
                    : [...selection, resource]
                )
              }
            />
          )}
        </AutoSizer>
      </div>

      <ElementsExpandPanel
        staticExpand
        isExpanded={expanded}
        setIsExpanded={setExpanded}
        artefact={
          selected._id && (selected.models || []).length > 0 ? { id: selected._id, type: 'specification' } : undefined
        }
      />
    </div>
  );
};

AddResBySpecification.propTypes = {
  isCreating: PropTypes.bool,
};

AddResBySpecification.defaultProps = {
  isCreating: false,
};

export { AddResBySpecification };
