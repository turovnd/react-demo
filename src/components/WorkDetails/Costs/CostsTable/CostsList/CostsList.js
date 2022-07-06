import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ChevronRight as IconDetails } from '@demo/bricks/icons';
import { IconButton, SkeletonGroup, Typography, VirtualTable } from '@demo/bricks';
import { DefaultTheme } from '@demo/theming';
import { useIntl } from '@demo/localization';

import {
  costsAllTableActions,
  costsAllTableSelectors,
  costsCommonActions,
  costsCommonSelectors,
} from '../../../../../redux/slices';
import { messages } from '../../../../../localization';
import { useDeepEffect } from '../../../../../utils/useDeepEffect';

export const GRID_TEMPLATE = ['135px', '2fr', '1fr'];

const CostsList = ({ tableHeight }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { formatMessage } = useIntl();

  const filters = useSelector(costsCommonSelectors.selectFilters);
  const rows = useSelector(costsAllTableSelectors.selectRows);
  const total = useSelector(costsAllTableSelectors.selectTotal);
  const isLoading = useSelector(costsAllTableSelectors.selectIsLoading);

  useDeepEffect(() => {
    dispatch(
      costsAllTableActions.searchRows.base({
        projectId,
        filters,
        reset: true,
      })
    );
  }, [filters]);

  const loadMoreRows = (startIndex, stopIndex) => {
    dispatch(
      costsAllTableActions.searchRows.base({
        projectId,
        filters,
        offset: startIndex,
        limit: stopIndex - startIndex + 1,
      })
    );
  };

  const handleSelectCost = cost => {
    dispatch(costsCommonActions.setCost.base({ cost }));
  };

  return (
    <VirtualTable
      height={tableHeight}
      isLoading={rows.length === 0 && isLoading}
      emptyText={!isLoading && total === 0 ? formatMessage(messages['costsList.allTable.empty']) : undefined}
      isItemLoaded={index => Boolean(rows[index])}
      itemSize={DefaultTheme.spacing(14)}
      loadMoreItems={loadMoreRows}
      itemCount={total}
      rows={rows}
      headerTemplate={{
        withEndAdornment: true,
        template: [
          { size: GRID_TEMPLATE[0], value: formatMessage(messages['costsList.allTable.type']) },
          { size: GRID_TEMPLATE[1], value: formatMessage(messages['costsList.allTable.name']) },
          { size: GRID_TEMPLATE[2], value: formatMessage(messages['costsList.allTable.contractor']) },
        ],
      }}
      rowTemplate={(row, index) => {
        if (!rows[index]) {
          return {
            withEndAdornment: true,
            template: [
              {
                size: '1fr',
                value: <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} />,
              },
            ],
          };
        }

        return {
          endAdornment: (
            <IconButton style={{ top: 6 }} size="small" onClick={() => handleSelectCost(rows[index])}>
              <IconDetails />
            </IconButton>
          ),
          template: [
            {
              size: GRID_TEMPLATE[0],
              value: (
                <Typography tooltip lineClamp={2}>
                  {formatMessage(messages[`contragentType.${row.contragentType}`])}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[1],
              value: (
                <Typography tooltip lineClamp={2}>
                  {row.name}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[2],
              value: (
                <Typography tooltip lineClamp={2}>
                  {row.contragentName || '-'}
                </Typography>
              ),
            },
          ],
        };
      }}
    />
  );
};

CostsList.propTypes = {
  tableHeight: PropTypes.number.isRequired,
};

export { CostsList };
