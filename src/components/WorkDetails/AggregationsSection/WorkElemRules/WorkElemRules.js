import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, ContainerTitle, Typography } from '@demo/bricks';
import { ElementsBrowser } from '@demo/elements-selection';
import { DefaultTheme, useModuleSize } from '@demo/theming';
import { useIntl } from '@demo/localization';
import { ROUTE_NAMES } from '@demo/registry-ui';

import { useNavigator } from '@demo/registry-ui/utils';
import { useStyles } from './WorkElemRules.styles';
import { workDetailsActions, externalActions, workDetailsSelectors } from '../../../../redux/slices';
import { messages } from '../../../../localization';

const isAggregationEmpty = ({ _id, selection }) => {
  if (_id) return false;
  return !Object.values(selection).some(item => item.length > 0);
};

const WorkElemRules = ({ isCreating, editingIndex, setEditingIndex, isOpen, setIsOpen, name }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const { projectId, workId } = useParams();
  const { formatMessage } = useIntl();
  const { height } = useModuleSize();

  const aggregations = useSelector(workDetailsSelectors.selectAggregations);

  const nameBlock = useRef();
  const rulesRef = useRef();
  const isCreatingAggregation = editingIndex === -1;

  const elementsBrowserHeight =
    height -
    // Container title.
    DefaultTheme.spacing(22.5) -
    // Work name
    ((nameBlock.current || {}).clientHeight || DefaultTheme.spacing(5));

  const handleClose = () => {
    setIsOpen(false);
    setEditingIndex(-1);
  };

  const handleSubmit = () => {
    if (isAggregationEmpty(rulesRef.current.getRule())) {
      dispatch(
        externalActions.showNotification.base({
          message: formatMessage(messages['notification.errorSaveRule']),
          variant: 'error',
        })
      );
      return;
    }

    const isUpdating = editingIndex > -1;

    if (isUpdating) {
      dispatch(
        workDetailsActions.updateAggregation.base({
          projectId,
          aggregation: rulesRef.current.getRule(),
          index: editingIndex,
          successMessage: formatMessage(messages['notifications.workDetails.updateAggregation']),
        })
      );
    } else {
      dispatch(
        workDetailsActions.addAggregation.base({
          projectId,
          aggregation: rulesRef.current.getRule(),
          successMessage: formatMessage(messages['notifications.workDetails.createAggregation']),
        })
      );
    }

    handleClose();
  };

  return isOpen ? (
    <div className={classes.root}>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={formatMessage(messages['workDetails.rules.create'])}
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
            color: 'primary',
            variant: 'contained',
            label: formatMessage(messages['button.save']),
            onClick: handleSubmit,
          },
        ]}
      />
      <div className={classes.nameBlock} ref={nameBlock}>
        <Typography>{formatMessage(messages['workDetails.name'], { name })}</Typography>
      </div>
      <ElementsBrowser
        projectId={projectId}
        height={elementsBrowserHeight}
        maxHeight={elementsBrowserHeight}
        variant="Tree"
        artefact={
          isCreatingAggregation
            ? undefined
            : {
                id: workId,
                type: 'work',
              }
        }
        rule={{
          isEditable: true,
          showEmpty: true,
          ref: rulesRef,
          rule: isCreatingAggregation ? undefined : aggregations[editingIndex],
        }}
      />
    </div>
  ) : null;
};

WorkElemRules.propTypes = {
  editingIndex: PropTypes.number.isRequired,
  isCreating: PropTypes.bool,
  isOpen: PropTypes.bool,
  setEditingIndex: PropTypes.func.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  name: PropTypes.string,
};

WorkElemRules.defaultProps = {
  isCreating: false,
  isOpen: false,
  name: '',
};

export { WorkElemRules };
