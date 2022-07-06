import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useFormatMessage } from '@demo/localization';
import PropTypes from 'prop-types';
import { Tooltip, Typography, SkeletonGroup, Skeleton, VirtualTable } from '@demo/bricks';
import {
  AccountCircle as IconAcc,
  Materials as IconMaterial,
  Circle as IconCircle,
  Gear as IconMech,
  Warning as IconWarning,
} from '@demo/bricks/icons';
import { DefaultTheme } from '@demo/theming';
import { ceil } from 'lodash';
import { resourcesListActions, resourcesListSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';
import { RES_TYPES } from '../../../definitions';

const ICONS_MAP = {
  [RES_TYPES.worker]: <IconAcc />,
  [RES_TYPES.material]: <IconMaterial />,
  [RES_TYPES.machinery]: <IconMech />,
};

const GRID_TEMPLATE = ['75px', '1fr', '80px', '80px', '80px', '80px'];

const ResourcesTable = ({ elements, filters, height }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const msg = useFormatMessage(messages);

  const isLoading = useSelector(resourcesListSelectors.selectIsLoading);
  const isBusy = useSelector(resourcesListSelectors.selectIsBusy);
  const rows = useSelector(resourcesListSelectors.selectRows);
  const totalRows = useSelector(resourcesListSelectors.selectTotal);

  // Group rows and get used group rows count to make right query for `loadMoreRows` and total display.
  const [groupRows, usedGroupRows] = useMemo(() => {
    let usedGroups = 0;

    const newRows = rows.reduce((acc, row, index, array) => {
      // Inject first row group.
      if (index === 0) {
        usedGroups += 1;
        return [{ type: 'group', resType: row.resType }, row];
      }

      // Inject row group if prev row type not the same as current row.
      if (array[index - 1] && array[index - 1].resType !== row.resType) {
        usedGroups += 1;
        return [...acc, { type: 'group', resType: row.resType }, row];
      }

      return [...acc, row];
    }, []);

    return [newRows, usedGroups];
  }, [rows]);

  const loadMoreRows = (startIndex, stopIndex) => {
    dispatch(
      resourcesListActions.searchRows.base({
        projectId,
        filters,
        elements,
        offset: startIndex - usedGroupRows,
        limit: stopIndex - startIndex - usedGroupRows,
      })
    );
  };

  const getItemSize = index => {
    if (!groupRows[index] || groupRows[index].type === 'group') {
      return DefaultTheme.spacing(9);
    }

    return DefaultTheme.spacing(14);
  };

  return (
    <VirtualTable
      height={height}
      itemCount={totalRows + usedGroupRows}
      itemSize={getItemSize}
      rows={rows}
      isLoading={rows.length === 0 && isLoading}
      emptyText={!isLoading && totalRows === 0 ? msg('resourcesList.table.empty') : undefined}
      isItemLoaded={index => Boolean(groupRows[index])}
      loadMoreItems={loadMoreRows}
      headerTemplate={{
        withStartAdornment: true,
        template: [
          { size: GRID_TEMPLATE[0], value: msg('resourcesList.table.code') },
          { size: GRID_TEMPLATE[1], value: msg('resourcesList.table.name') },
          { size: GRID_TEMPLATE[2], value: msg('resourcesList.table.unit') },
          { size: GRID_TEMPLATE[3], value: msg('resourcesList.table.consumption'), align: 'right' },
          { size: GRID_TEMPLATE[4], value: msg('resourcesList.table.price'), align: 'right' },
          { size: GRID_TEMPLATE[5], value: msg('resourcesList.table.cost'), align: 'right' },
        ],
      }}
      // eslint-disable-next-line react/no-unstable-nested-components
      rowTemplate={(row, index) => {
        // Display placeholder on loading.
        if (!groupRows[index]) {
          return {
            centered: true,
            template: [{ size: '1fr', value: <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} /> }],
          };
        }

        // Display group name.
        if (groupRows[index].type === 'group') {
          return {
            centered: true,
            template: [
              {
                size: '20px',
                value: ICONS_MAP[groupRows[index].resType],
              },
              {
                size: '1fr',
                value: <Typography>{msg(`resourcesList.type.${groupRows[index].resType}`)}</Typography>,
              },
            ],
          };
        }

        const { price, consumption } = groupRows[index];
        const isWarningInRow = !groupRows[index].consumption || !price;
        const total = price * groupRows[index].consumption;

        return {
          withStartAdornment: true,
          startAdornment: isWarningInRow ? (
            <Tooltip title={msg('resources.rowWithError')}>
              <IconCircle color="warning" size="small" />
            </Tooltip>
          ) : undefined,
          template: [
            {
              size: GRID_TEMPLATE[0],
              value: (
                <Typography tooltip lineClamp={2}>
                  {groupRows[index].code}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[1],
              value: (
                <Typography tooltip lineClamp={2}>
                  {groupRows[index].name}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[2],
              value: (
                <Typography tooltip noWrap>
                  {groupRows[index].unitText}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[3],
              value: isBusy ? (
                <Skeleton height="min-content" variant="text" />
              ) : (
                <Typography
                  noWrap
                  variant="number"
                  tooltip={consumption ? ceil(consumption, 2) : msg('resources.emptyConsumption')}
                >
                  {consumption ? ceil(consumption, 2) : <IconWarning color="warning" />}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[4],
              value: (
                <Typography noWrap variant="number" tooltip={!price ? msg('resources.emptyPrice') : ceil(price, 2)}>
                  {!price ? <IconWarning color="warning" /> : ceil(price)}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[5],
              value: isBusy ? (
                <Skeleton height="min-content" variant="text" />
              ) : (
                <Typography tooltip={ceil(total, 2)} noWrap variant="number">
                  {ceil(total)}
                </Typography>
              ),
            },
          ],
        };
      }}
    />
  );
};

ResourcesTable.propTypes = {
  filters: PropTypes.array.isRequired,
  elements: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

export { ResourcesTable };
