import React from 'react';
import { ContainerTitle, Table, TableHead, TableRow, Typography } from '@demo/bricks';
import { Remove as IconRemove, Edit as IconEdit, Add as IconAdd } from '@demo/bricks/icons';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from '@demo/localization';

import { costsCommonActions, workDetailsActions, workDetailsSelectors } from '../../../redux/slices';
import { useStyles } from './CostsSection.styles';
import { messages } from '../../../localization';
import { COSTS_TABS } from '../../../definitions';

const GRID_TEMPLATE = ['85px', '1fr', '1fr'];

const CostsSection = ({ canEdit }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const costPositions = useSelector(workDetailsSelectors.selectCosts);
  const isLoading = useSelector(workDetailsSelectors.selectIsLoading);

  const handleAddCost = () => {
    dispatch(
      costsCommonActions.setIsOpen.base({
        isOpen: true,
        tab: COSTS_TABS.ALL,
        costPositions,
      })
    );
  };

  const handleEditCost = () => {
    dispatch(
      costsCommonActions.setIsOpen.base({
        isOpen: true,
        tab: COSTS_TABS.LINKED,
        costPositions,
      })
    );
  };

  const handleRemoveCost = costId => {
    dispatch(workDetailsActions.removeWorkCost.base({ costId }));
  };

  return (
    <div className={classes.section}>
      <ContainerTitle
        tag="h3"
        title={formatMessage(messages['workDetails.costs.title'])}
        padding="small"
        actions={[
          {
            hidden: !canEdit,
            label: '_Add',
            icon: <IconAdd />,
            onClick: handleAddCost,
            tooltip: formatMessage(messages['workDetails.costs.addTooltip']),
          },
        ]}
      />

      <Table
        withActions
        gridTemplate={GRID_TEMPLATE}
        isLoading={isLoading}
        emptyText={costPositions.length === 0 && formatMessage(messages['workDetails.costs.table.empty'])}
        headerContent={
          <TableHead variant="light">
            <Typography variant="caption">{formatMessage(messages['workDetails.costs.table.type'])}</Typography>
            <Typography variant="caption">{formatMessage(messages['workDetails.costs.table.name'])}</Typography>
            <Typography variant="caption">{formatMessage(messages['workDetails.costs.table.position'])}</Typography>
          </TableHead>
        }
      >
        {costPositions.map(position => {
          const { costDetails = {} } = position || {};

          return (
            <TableRow
              actions={[
                {
                  hidden: !canEdit,
                  startAdornment: <IconEdit />,
                  label: formatMessage(messages['button.edit']),
                  onClick: handleEditCost,
                },
                {
                  hidden: !canEdit,
                  startAdornment: <IconRemove />,
                  label: formatMessage(messages['button.remove']),
                  onClick: () => handleRemoveCost(position._id),
                },
              ]}
            >
              <Typography lineClamp={3} tooltip>
                {formatMessage(messages[`contragentType.${costDetails.contragentType}`])}
              </Typography>
              <Typography lineClamp={3} tooltip>
                {costDetails.name}
              </Typography>
              <Typography lineClamp={3} tooltip>
                {position.position}. {position.name}
              </Typography>
            </TableRow>
          );
        })}
      </Table>
    </div>
  );
};

CostsSection.propTypes = {
  canEdit: PropTypes.bool,
};

CostsSection.defaultProps = {
  canEdit: false,
};

export { CostsSection };
