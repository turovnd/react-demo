import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams, useLocation } from 'react-router-dom';
import { IconButton, Tooltip, SkeletonGroup, Typography, Skeleton, VirtualTable } from '@demo/bricks';
import { DefaultTheme } from '@demo/theming';
import {
  SyncCrossed as IconSyncOff,
  SyncSuccess as IconSync,
  ChevronRight as IconDetails,
  Remove as IconRemove,
  Edit as IconEdit,
  Link as IconLink,
  LinkCrossed as IconLinkClose,
} from '@demo/bricks/icons';
import { preventClickThrough } from '@demo/bricks/utils';
import { ROUTE_NAMES } from '@demo/registry-ui';
import { useFormatMessage } from '@demo/localization';
import cx from 'classnames';
import { round } from 'lodash';
import { useNavigator } from '@demo/registry-ui/utils';

import { externalSelectors, workDetailsActions, worksListSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';
import { I18N_UNITS } from '../../../definitions';
import { ANIMATION_ROW_PULSE_DURATION, useStyles } from './WorksTable.styles';
import { suggestLoadModels } from '../../../utils/suggestLoadModels';

const GRID_TEMPLATE = ['100px', '1fr', '50px', '60px', '85px'];

const WorksTable = ({
  setRemoveDialog,
  loadMoreItems,
  filters,
  selected,
  setSelected,
  panelExpanded,
  setPanelExpanded,
  height,
  setArtefactRuleEditingMode,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const navigate = useNavigator();
  const msg = useFormatMessage(messages);
  const query = new URLSearchParams(useLocation().search);

  const rows = useSelector(worksListSelectors.selectRows);
  const total = useSelector(worksListSelectors.selectTotal);
  const isLoading = useSelector(worksListSelectors.selectIsLoading);
  const volumes = useSelector(worksListSelectors.selectVolume);
  const volumesLoading = useSelector(worksListSelectors.selectVolumeLoading);
  const storeModels = useSelector(externalSelectors.selectModels);
  const worksModels = useSelector(worksListSelectors.selectWorksModelsMap);
  const loadedModels = useSelector(externalSelectors.selectModelsData);

  const tableRef = useRef();
  const isScrolledToRow = useRef(false);
  const [scrollToRow, setScrollToRow] = useState(null);

  useEffect(() => {
    if (rows.length === 0 || isLoading || isScrolledToRow.current) return;

    // Pulse row animation and scroll to if has last opened cost id.
    if (query.has('workId') || query.has('workIndex')) {
      const lastId = query.get('workId');

      let targetIndex = rows.findIndex(row => row._id === lastId);

      if (targetIndex === -1 && query.has('workIndex')) {
        targetIndex = parseInt(query.get('workIndex'), 10);
      }

      if (targetIndex > -1) {
        setScrollToRow(targetIndex);
        if (tableRef && tableRef.current) {
          tableRef.current.scrollToItem(targetIndex);
        }
      }

      isScrolledToRow.current = true;
    }
  }, [isLoading, rows.length]);

  const showEmptyFilterText = filters.length > 0 && !isLoading && total === 0;

  const getVolume = (id, key, coeff = 1) =>
    (((volumes || {})[id] || {})[key] || (((volumes || {})[id] || {}).attributes || {})[key] || 0) / coeff;

  const getPrice = row => {
    const volume = getVolume(row._id, row.unitKey, row.unitCoeff);
    let price = 0;
    (row.resources || []).forEach(res => {
      if (res.source === 'specification') {
        const specVolume = getVolume(row._id + res.details.specificationId, res.details.attribute);
        price += (specVolume || 0) * (res.consumption || 0) * (res.price || 0);
      } else {
        price += (volume || 0) * (res.consumption || 0) * (res.price || 0);
      }
    });
    return price;
  };

  const handleDetailsClick = (row, index, event = null) => {
    if (event) {
      preventClickThrough(event);
    }

    navigate(
      ROUTE_NAMES.WORKS_WORK_DETAILS,
      {
        projectId,
        workId: row._id,
      },
      { workIndex: index }
    );
  };

  const handleEditClick = (row, index) => {
    handleDetailsClick(row, index);
    dispatch(workDetailsActions.setIsEditing.base({ editing: true }));
  };

  const storeModelsIds = storeModels.map(m => m._id);

  return (
    <VirtualTable
      ref={{ tableRef }}
      height={height}
      itemCount={total}
      itemSize={DefaultTheme.spacing(14)}
      rows={rows}
      isLoading={rows.length === 0 && isLoading}
      emptyText={showEmptyFilterText ? msg('worksList.table.empty') : undefined}
      headerTemplate={{
        withEndAdornment: true,
        withActions: true,
        template: [
          { size: GRID_TEMPLATE[0], value: msg('worksList.table.code') },
          { size: GRID_TEMPLATE[1], value: msg('worksList.table.name') },
          { size: GRID_TEMPLATE[2], value: msg('worksList.table.unit') },
          { size: GRID_TEMPLATE[3], align: 'right', value: msg('worksList.table.quantity') },
          { size: GRID_TEMPLATE[4], align: 'right', value: msg('worksList.table.price') },
        ],
      }}
      loadMoreItems={loadMoreItems}
      isItemLoaded={index => Boolean(rows[index])}
      rowTemplate={(row, index) => {
        if (!row) {
          return {
            centered: 'true',
            template: [{ size: '1fr', value: <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} /> }],
          };
        }

        const modelsData = Object.values(loadedModels).filter(loadedModel =>
          (worksModels[row._id] || []).includes(loadedModel._id)
        );

        const isRowVolumeLoading = (volumesLoading || {})[row._id];

        const shouldGlow = scrollToRow === index;

        if (shouldGlow) {
          setTimeout(() => {
            setScrollToRow(null);
          }, ANIMATION_ROW_PULSE_DURATION);
        }

        const volume = getVolume(row._id, row.unitKey, row.unitCoeff);
        const price = getPrice(row);
        const isLinkActive = selected.id === row._id && panelExpanded;

        return {
          selected: row._id === selected.id,

          onClick: () => {
            const workModelsIds = worksModels[row._id];
            if (
              workModelsIds &&
              workModelsIds.length > 0 &&
              workModelsIds.some(modelId => !storeModelsIds.includes(modelId))
            ) {
              suggestLoadModels(msg, dispatch, projectId, workModelsIds);
              return;
            }

            setSelected(
              selected === row._id
                ? { section: null, id: null, name: null }
                : { id: row._id, section: row.section, name: row.name }
            );
          },

          classes: {
            endAdornment: classes.endAdornment,
            root: cx({ [classes.scrollToRowPulse]: shouldGlow }),
          },

          template: [
            {
              size: GRID_TEMPLATE[0],
              value: (
                <div className={classes.codeCell}>
                  {isRowVolumeLoading ? (
                    <Skeleton className={classes.skeleton} variant="circle" width={18} height={18} />
                  ) : (
                    <Tooltip
                      title={msg('worksList.syncIcon', {
                        modelsCount: modelsData.length,
                        models: (modelsData || [])
                          .map(m => (m || {}).name)
                          .filter(n => !!n)
                          .join(', '),
                      })}
                    >
                      {modelsData.length > 0 ? <IconSync color="success" /> : <IconSyncOff color="disabled" />}
                    </Tooltip>
                  )}
                  <Typography tooltip lineClamp={2} className={classes.breakAll}>
                    {row.code}
                  </Typography>
                </div>
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
                  {I18N_UNITS.find(i => i.value === row.unitKey)
                    ? `${row.unitCoeff} ${msg(I18N_UNITS.find(i => i.value === row.unitKey).label)}`
                    : row.unitText}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[3],
              value: (
                <Typography variant="number" tooltip={!isRowVolumeLoading && round(volume || 0, 2)} lineClamp={2}>
                  {isRowVolumeLoading ? <Skeleton /> : volume || 0}
                </Typography>
              ),
            },
            {
              size: GRID_TEMPLATE[4],
              value: (
                <Typography variant="number" tooltip={!isRowVolumeLoading && round(price, 2)} lineClamp={2}>
                  {isRowVolumeLoading ? <Skeleton /> : price}
                </Typography>
              ),
            },
          ],

          actions: [
            {
              startAdornment: isLinkActive ? <IconLinkClose /> : <IconLink />,
              label: isLinkActive ? msg('worksList.table.changeLink.close') : msg('worksList.table.changeLink'),
              hidden: isRowVolumeLoading,
              onClick: () => {
                setArtefactRuleEditingMode(false);
                setPanelExpanded(!isLinkActive);
                setSelected(
                  isLinkActive
                    ? { section: null, id: null, name: null }
                    : { id: row._id, section: row.section, name: row.name }
                );
              },
            },
            {
              startAdornment: <IconEdit />,
              label: msg('button.edit'),
              onClick: () => handleEditClick(row, index),
            },
            {
              startAdornment: <IconRemove />,
              label: msg('button.remove'),
              onClick: () => setRemoveDialog({ open: true, workId: row._id }),
            },
          ],

          endAdornment: (
            <IconButton size="small" onClick={e => handleDetailsClick(row, index, e)}>
              <IconDetails />
            </IconButton>
          ),
        };
      }}
    />
  );
};

WorksTable.propTypes = {
  height: PropTypes.number.isRequired,
  filters: PropTypes.array.isRequired,
  loadMoreItems: PropTypes.func.isRequired,
  setRemoveDialog: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired,
  selected: PropTypes.string,
  panelExpanded: PropTypes.bool.isRequired,
  setPanelExpanded: PropTypes.func.isRequired,
  setArtefactRuleEditingMode: PropTypes.func.isRequired,
};

WorksTable.defaultProps = {
  selected: null,
};

export { WorksTable };
