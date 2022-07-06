import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DefaultTheme, useModuleSize } from '@demo/theming';
import { Checkbox, SkeletonGroup, Table, TableHead, TableRow, Typography } from '@demo/bricks';
import { DropDown as IconExpanded, DropRight as IconExpand } from '@demo/bricks/icons';
import { intersection } from 'lodash';
import { preventClickThrough } from '@demo/bricks/utils';
import { useFormatMessage } from '@demo/localization';

import { addWorkByRuleActions, addWorkByRuleSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';
import { useStyles } from './WorksTable.styles';
import { getRuleDisplayString } from '../../../utils/getRuleDisplayString';
import { COLOR_RULE } from '../../../definitions';
import { getRuleKeywords } from '../../../utils/getRuleKeywords';

const GRID_TEMPLATE = ['minmax(180px, 2fr)', '3fr', '110px'];
const BASE_ROW_TEMPLATE = ['18px', '1fr', '110px'];

const ROW_HEIGHT_UNITS = 9;
const WORK_ROW_HEIGHT_UNITS = 9;

const WorksTable = ({ filter }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const msg = useFormatMessage(messages);
  const { height } = useModuleSize();
  const { projectId } = useParams();

  const selectedWorksIds = useSelector(addWorkByRuleSelectors.selectSelectedWorks);
  const rows = useSelector(addWorkByRuleSelectors.selectRows);
  const total = useSelector(addWorkByRuleSelectors.selectTotal);
  const isLoading = useSelector(addWorkByRuleSelectors.selectIsLoading);

  const tableRef = useRef();
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    dispatch(addWorkByRuleActions.searchRows.base({ projectId, filters: filter, reset: true }));
  }, [filter]);

  const tableHeight =
    height -
    // ContainerTitle.
    DefaultTheme.spacing(22.5) -
    // Search field.
    DefaultTheme.spacing(10);

  const showEmptyFilterText = !isLoading && total === 0;

  const getRowHeight = ({ index }) => {
    if (expanded.includes(rows[index]._id)) {
      return DefaultTheme.spacing(ROW_HEIGHT_UNITS + ((rows[index] || {}).works || []).length * WORK_ROW_HEIGHT_UNITS);
    }

    return DefaultTheme.spacing(ROW_HEIGHT_UNITS);
  };

  const handleExpandRow = (rowId, isExpanded, index) => {
    if (isExpanded) {
      setExpanded(expanded.filter(id => id !== rowId));
    } else {
      setExpanded([...expanded, rowId]);
    }

    if (tableRef.current) {
      tableRef.current.recomputeRowHeights(index);
    }
  };

  const loadMoreRows = ({ startIndex, stopIndex }) => {
    dispatch(
      addWorkByRuleActions.searchRows.base({
        projectId,
        filters: filter,
        offset: startIndex,
        limit: stopIndex - startIndex,
      })
    );
  };

  return (
    <Table
      ref={tableRef}
      variant="virtual"
      isLoading={rows.length === 0 && isLoading}
      style={{ height: tableHeight }}
      gridTemplate={GRID_TEMPLATE}
      emptyText={showEmptyFilterText && 'Работы не найдены'}
      headerContent={
        <TableHead variant="light" gridTemplate={GRID_TEMPLATE}>
          <Typography variant="caption">{msg('CreateWorkByRule.WorksTable.header.code')}</Typography>
          <Typography variant="caption">{msg('CreateWorkByRule.WorksTable.header.name')}</Typography>
          <Typography align="right" variant="caption">
            {msg('CreateWorkByRule.WorksTable.header.qty')}
          </Typography>
        </TableHead>
      }
      virtualProps={{
        minimumBatchSize: 100,
        loadMoreRows,
        isRowLoaded: ({ index }) => Boolean(rows[index]),
        rowCount: total,
        rowHeight: getRowHeight,
        // eslint-disable-next-line react/prop-types
        rowRenderer: ({ index, key, style }) => {
          // Display placeholder on loading.
          if (!rows[index]) {
            return (
              <TableRow centered key={key} style={style}>
                <SkeletonGroup rowsCount={1} gridTemplate={BASE_ROW_TEMPLATE} />
              </TableRow>
            );
          }

          const row = rows[index] || {};
          const isExpanded = expanded.includes(row._id);

          const [isChecked, isIndeterminate] = (() => {
            const rowWorkIds = (row.works || []).map(w => w._id);
            const commonIds = intersection(rowWorkIds, selectedWorksIds) || [];

            if (rowWorkIds.length > 0 && commonIds.length === rowWorkIds.length) {
              return [true, false];
            }

            if (commonIds.length > 0) {
              return [true, true];
            }

            return [false, false];
          })();

          return (
            <div key={key} style={style}>
              <TableRow
                onClick={() => handleExpandRow(row._id, isExpanded, index)}
                style={{ height: DefaultTheme.spacing(ROW_HEIGHT_UNITS) }}
                key={key}
                className={classes.row}
                startAdornment={isExpanded ? <IconExpanded /> : <IconExpand />}
                gridTemplate={BASE_ROW_TEMPLATE}
              >
                <Checkbox
                  classes={{ root: classes.checkbox }}
                  checked={isChecked}
                  indeterminate={isIndeterminate}
                  onClick={e => preventClickThrough(e)}
                  onChange={() =>
                    dispatch(
                      addWorkByRuleActions.checkWorks.base({
                        works: row.works.map(w => ({
                          workId: w._id,
                          workName: w.name,
                          ruleId: row._id,
                        })),
                      })
                    )
                  }
                />
                <Typography mark={{ [COLOR_RULE]: getRuleKeywords(row, msg) }} tooltip noWrap>
                  {getRuleDisplayString(row, msg)}
                </Typography>
                <Typography variant="number" tooltip lineClamp={2}>
                  {row.works.reduce((acc, w) => acc + w.amount || 0, 0)}
                </Typography>
              </TableRow>

              {isExpanded &&
                (row.works || []).map(work => (
                  <TableRow
                    withStartAdornment
                    key={work._id}
                    className={classes.row}
                    style={{ height: DefaultTheme.spacing(WORK_ROW_HEIGHT_UNITS) }}
                    gridTemplate={['18px', '18px', ...GRID_TEMPLATE]}
                  >
                    <div />
                    <Checkbox
                      checked={selectedWorksIds.includes(work._id)}
                      onClick={e => preventClickThrough(e)}
                      onChange={() =>
                        dispatch(
                          addWorkByRuleActions.checkWorks.base({
                            works: [
                              {
                                workId: work._id,
                                workName: work.name,
                                ruleId: row._id,
                              },
                            ],
                          })
                        )
                      }
                    />
                    <Typography tooltip noWrap>
                      {work.code}
                    </Typography>
                    <Typography tooltip noWrap>
                      {work.name}
                    </Typography>
                    <Typography noWrap variant="number">
                      {work.amount}
                    </Typography>
                  </TableRow>
                ))}
            </div>
          );
        },
      }}
    />
  );
};

WorksTable.propTypes = {
  filter: PropTypes.array.isRequired,
};

export { WorksTable };
