import React, { Fragment, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, Container, SkeletonGroup, Table, TableHead, TableRow, TextField, Typography } from '@demo/bricks';
import { useFormatMessage } from '@demo/localization';
import { DefaultTheme, useModuleSize } from '@demo/theming';
import { Search as IconSearch } from '@demo/bricks/icons';
import PropTypes from 'prop-types';

import { useStyles } from './LinkedTable.styles';
import { messages } from '../../../../localization';
import { costsCommonActions, costsCommonSelectors, workDetailsSelectors } from '../../../../redux/slices';
import { LINKED_COSTS_TABLE_ROW_TYPES } from '../../../../definitions';
import { SectionName } from '../../../common/SectionName';
import { transformSelectedPositionsToLinkedTableRows } from '../../../../utils/transformers';
import { Tabs } from '../Tabs';

const GRID_TEMPLATE = ['125px', 'minmax(80px, 100px)', '1fr', '60px', '60px', '75px'];

const LinkedTable = ({ expandHeight }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { height } = useModuleSize();
  const msg = useFormatMessage(messages);

  const selectedPositions = useSelector(costsCommonSelectors.selectSelectedPositions);
  const initialSelectedPositions = useSelector(costsCommonSelectors.selectOpenedWithSelectedPositions);
  const isEditing = useSelector(workDetailsSelectors.selectIsEditing);

  const [filter, setFilter] = useState('');

  const rows = useMemo(() => {
    let rowsSource = selectedPositions;
    if (isEditing) {
      rowsSource = initialSelectedPositions;
    }

    return transformSelectedPositionsToLinkedTableRows(rowsSource, msg('costsList.search.emptySection'));
  }, [isEditing, selectedPositions, initialSelectedPositions]);

  const tableHeight =
    height -
    // ContainerTitle.
    DefaultTheme.spacing(22.5) -
    // Search field.
    DefaultTheme.spacing(10) -
    // Tabs.
    DefaultTheme.spacing(15) -
    // Expand panel
    expandHeight;

  const getRowHeight = ({ index }) => {
    if (rows[index].displayType === LINKED_COSTS_TABLE_ROW_TYPES.COST) {
      return DefaultTheme.spacing(14);
    }

    if (rows[index].displayType === LINKED_COSTS_TABLE_ROW_TYPES.SECTION) {
      return DefaultTheme.spacing(9);
    }

    return DefaultTheme.spacing(14);
  };

  const handleCheckPositions = (positions, sectionClear) => {
    if (sectionClear) {
      dispatch(costsCommonActions.toggleSelectedPositions.base({ sectionClear }));
      return;
    }

    dispatch(costsCommonActions.toggleSelectedPositions.base({ positions }));
  };

  const isRowChecked = row => Boolean(selectedPositions.find(pos => pos._id === row._id));

  const getSectionCheckboxState = useCallback(
    section => {
      const sectionPositionsRows = rows.filter(
        row => row.displayType === LINKED_COSTS_TABLE_ROW_TYPES.POSITION && row.section === section
      );

      const isSectionChecked = sectionPositionsRows.every(isRowChecked);
      const isSectionIndeterminate = !isSectionChecked && sectionPositionsRows.some(isRowChecked);

      return [isSectionChecked, isSectionIndeterminate, sectionPositionsRows];
    },
    [selectedPositions.length, rows.length]
  );

  return (
    <Fragment>
      <Container paddingH="small">
        <TextField
          fullWidth
          variant="outlined"
          endAdornment={<IconSearch />}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder={msg('search')}
        />
      </Container>

      <Tabs />

      <Table
        variant="virtual"
        style={{ height: tableHeight }}
        gridTemplate={GRID_TEMPLATE}
        emptyText={rows.length === 0 && msg('costsList.linkedTable.empty')}
        headerContent={
          <TableHead variant="light" gridTemplate={GRID_TEMPLATE}>
            <Typography variant="caption">{msg('costsList.costTable.number')}</Typography>
            <Typography variant="caption">{msg('costsList.costTable.cipher')}</Typography>
            <Typography variant="caption">{msg('costsList.costTable.name')}</Typography>
            <Typography variant="caption">{msg('costsList.costTable.unit')}</Typography>
            <Typography align="right" variant="caption">
              {msg('costsList.costTable.quantity')}
            </Typography>
            <Typography align="right" variant="caption">
              {msg('costsList.costTable.total')}
            </Typography>
          </TableHead>
        }
        virtualProps={{
          rowCount: rows.length,
          rowHeight: getRowHeight,
          rowRenderer: ({ index, key, style }) => {
            // Display placeholder on loading.
            if (!rows[index]) {
              return (
                <TableRow centered key={key} style={style}>
                  <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} />
                </TableRow>
              );
            }

            const row = rows[index] || {};

            if (row.displayType === LINKED_COSTS_TABLE_ROW_TYPES.COST) {
              return (
                <TableRow centered key={key} style={style} gridTemplate={['1fr']}>
                  <Typography mark={{ search: filter }} lineClamp={2} tooltip>
                    {row.name}
                  </Typography>
                </TableRow>
              );
            }

            if (row.displayType === LINKED_COSTS_TABLE_ROW_TYPES.SECTION) {
              const [isChecked, isIndeterminate, sectionRows] = getSectionCheckboxState(row.section);

              return (
                <SectionName
                  key={key}
                  style={style}
                  text={row.section}
                  number={row.total}
                  search={filter}
                  checkbox={{
                    checked: isChecked || isIndeterminate,
                    indeterminate: isIndeterminate,
                    onChange: () => handleCheckPositions(sectionRows, isIndeterminate && row.section),
                  }}
                />
              );
            }

            const unit = typeof row.unit === 'string' ? row.unit : (row.unit || {}).text;

            return (
              <TableRow key={key} style={style} gridTemplate={GRID_TEMPLATE}>
                <div className={classes.positionRowCol}>
                  <Checkbox checked={isRowChecked(row)} onChange={() => handleCheckPositions([row])} />
                  <Typography tooltip noWrap>
                    {row.position}
                  </Typography>
                </div>

                <Typography mark={{ search: filter }} tooltip lineClamp={2}>
                  {row.code}
                </Typography>
                <Typography mark={{ search: filter }} tooltip lineClamp={2}>
                  {row.name}
                </Typography>
                <Typography tooltip lineClamp={2}>
                  {unit}
                </Typography>
                <Typography variant="number" numberRound={2}>
                  {row.volume}
                </Typography>
                <Typography variant="number">{row.totalPrice}</Typography>
              </TableRow>
            );
          },
        }}
      />
    </Fragment>
  );
};

LinkedTable.propTypes = {
  expandHeight: PropTypes.number.isRequired,
};
export { LinkedTable };
