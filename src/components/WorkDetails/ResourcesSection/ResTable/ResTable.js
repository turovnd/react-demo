import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { Table, TableHead, Typography } from '@demo/bricks';
import { useIntl } from '@demo/localization';

import { messages } from '../../../../localization';
import { workDetailsSelectors } from '../../../../redux/slices';

const ResTable = ({ gridTemplate, workDetails, children }) => {
  const { formatMessage } = useIntl();
  const isWorkLoading = useSelector(workDetailsSelectors.selectIsLoading);

  const unitLabel = messages[`attributes.${workDetails.unitKey}.unit`]
    ? formatMessage(messages[`attributes.${workDetails.unitKey}.unit`])
    : workDetails.unitKey;

  return (
    <Table
      withActions
      withStartAdornment
      isLoading={isWorkLoading}
      gridTemplate={gridTemplate}
      headerContent={
        <TableHead variant="light">
          <Typography lineClamp={2} variant="caption" tooltip>
            {formatMessage(messages['workDetails.resources.table.base'])}
          </Typography>
          <Typography lineClamp={2} variant="caption" tooltip>
            {formatMessage(messages['workDetails.resources.table.name'])}
          </Typography>
          <Typography lineClamp={2} variant="caption" tooltip>
            {formatMessage(messages['workDetails.resources.table.unit'])}
          </Typography>
          <Typography lineClamp={3} variant="caption" align="right" tooltip>
            {`${formatMessage(messages['workDetails.resources.table.unitConsumption'])}
            (${workDetails.unitCoeff} ${unitLabel})`}
          </Typography>
          <Typography lineClamp={3} variant="caption" align="right" tooltip>
            {`${formatMessage(messages['workDetails.resources.table.volume'])} (${unitLabel})`}
          </Typography>
          <Typography lineClamp={3} variant="caption" align="right" tooltip>
            {formatMessage(messages['workDetails.resources.table.consumption'])}
          </Typography>
          <Typography lineClamp={2} variant="caption" align="right">
            {formatMessage(messages['workDetails.resources.table.price'])}
          </Typography>
          <Typography lineClamp={2} variant="caption" align="right">
            {formatMessage(messages['workDetails.resources.table.cost'])}
          </Typography>
        </TableHead>
      }
    >
      {children}
    </Table>
  );
};

ResTable.propTypes = {
  children: PropTypes.node.isRequired,
  gridTemplate: PropTypes.array.isRequired,
  workDetails: PropTypes.object.isRequired,
};

export { ResTable };
