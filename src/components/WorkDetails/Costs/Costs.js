import { Breadcrumbs, ContainerTitle } from '@demo/bricks';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { ROUTE_NAMES } from '@demo/registry-ui';
import { useFormatMessage } from '@demo/localization';
import { useParams } from 'react-router-dom';
import { useNavigator } from '@demo/registry-ui/utils';
import {
  costsAllTableActions,
  costsCommonActions,
  costsCommonSelectors,
  workDetailsActions,
} from '../../../redux/slices';

import { CostsTable } from './CostsTable';
import { COSTS_TABS } from '../../../definitions';
import { ElementsExpandPanel } from '../../common/ElementsExpandPanel';
import { LinkedTable } from './LinkedTable';
import { messages } from '../../../localization';
import { useStyles } from './Costs.styles';

const Costs = ({ isCreating }) => {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const msg = useFormatMessage(messages);
  const { projectId } = useParams();
  const classes = useStyles();

  const cost = useSelector(costsCommonSelectors.selectCost);
  const tab = useSelector(costsCommonSelectors.selectTab);
  const selectedCostsPositions = useSelector(costsCommonSelectors.selectSelectedPositions);
  const isCreatingCostByWork = useSelector(costsCommonSelectors.selectIsCreatingWorkByCost);

  const [expanded, setExpanded] = useState(false);
  const [expandHeight, setExpandHeight] = useState(56);

  // Clear on close.
  useEffect(
    () => () => {
      dispatch(costsCommonActions.devitalize.base());
      dispatch(costsAllTableActions.devitalize.base());
    },
    []
  );

  const handleClose = () => {
    if (isCreatingCostByWork) {
      navigate(ROUTE_NAMES.WORKS, { projectId });
    } else {
      dispatch(costsCommonActions.setIsOpen.base({ isOpen: false }));
    }
  };

  const handleSubmit = () => {
    // Add selected cost positions to the work.
    dispatch(
      workDetailsActions.setWorkCosts.base({
        projectId,
        costs: selectedCostsPositions,
        successMessage: msg('notifications.workDetails.addResourcesFromCostsSuccess'),
      })
    );

    // If creating work - set work data like name, unit ...
    if (isCreatingCostByWork) {
      const firstSelectedCostPosition = (selectedCostsPositions || [])[0] || {};
      dispatch(
        workDetailsActions.setWorkParams.base({
          name: firstSelectedCostPosition.name,
          code: firstSelectedCostPosition.code,
          unitCoeff: (firstSelectedCostPosition.unit || {}).coeff,
          unitKey: (firstSelectedCostPosition.unit || {}).key,
          unitLabel: (firstSelectedCostPosition.unit || {}).label,
        })
      );
    }

    // Close the costs window.
    dispatch(costsCommonActions.setIsOpen.base({ isOpen: false }));
  };

  return (
    <div className={classes.root}>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={msg(isCreatingCostByWork ? 'WorkDetails.Costs.titleAddWorkByCost' : 'costsList.title')}
        subtitle={
          <Breadcrumbs
            items={
              isCreatingCostByWork
                ? [
                    {
                      label: msg('worksList.title'),
                      onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
                    },
                  ]
                : [
                    {
                      label: msg('worksList.title'),
                      onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
                    },
                    {
                      label: msg(isCreating ? 'workDetails.titleCreate' : 'workDetails.title'),
                      onClick: handleClose,
                    },
                  ]
            }
          />
        }
        actions={[
          {
            hidden: Boolean(cost),
            label: msg('button.cancel'),
            onClick: handleClose,
          },
          {
            hidden: !cost,
            label: msg('button.back'),
            onClick: () => {
              dispatch(costsCommonActions.setCost.base({ cost: null }));
            },
          },
          {
            label: msg(isCreatingCostByWork ? 'button.continue' : 'button.save'),
            variant: 'contained',
            color: 'primary',
            disabled: selectedCostsPositions.length === 0,
            onClick: handleSubmit,
          },
        ]}
      />

      {tab === COSTS_TABS.ALL && <CostsTable isCreating={isCreating} expandHeight={expandHeight} />}
      {tab === COSTS_TABS.LINKED && <LinkedTable expandHeight={expandHeight} />}

      <ElementsExpandPanel
        staticExpand
        isExpanded={expanded}
        setIsExpanded={setExpanded}
        setExpandHeight={setExpandHeight}
      />
    </div>
  );
};

Costs.propTypes = {
  isCreating: PropTypes.bool,
};

Costs.defaultProps = {
  isCreating: false,
};

export { Costs };
