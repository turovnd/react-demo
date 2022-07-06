import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ContainerTitle, SkeletonGroup, Table, TableHead, TableRow, Typography } from '@demo/bricks';
import { Project as IconProject, DropDown as IconExpanded, DropRight as IconExpand } from '@demo/bricks/icons';
import { ceil } from 'lodash';

import { useIntl } from '@demo/localization';
import { useStyles } from './VolumesSection.styles';
import { messages } from '../../../localization';
import { externalSelectors, workDetailsSelectors } from '../../../redux/slices';

const GRID_TEMPLATE = ['1fr', '75px', '95px', '80px', '60px', '80px'];

const VolumesSection = () => {
  const classes = useStyles();
  const { formatMessage } = useIntl();

  const project = useSelector(externalSelectors.selectProject) || {};
  const volumes = useSelector(workDetailsSelectors.selectVolumes);
  const workIsLoading = useSelector(workDetailsSelectors.selectIsLoading);
  const volumesIsLoading = useSelector(workDetailsSelectors.selectVolumesIsLoading);
  const isProjectLoading = useSelector(externalSelectors.selectIsProjectLoading);

  const models = Array.from(new Set(volumes.reduce((arr, n) => arr.concat([n.modelVersionId]), [])));
  const modelsData = useSelector(state => models.map(id => externalSelectors.selectModelData(state, id)));
  const modelsDataMap = modelsData.filter(m => !!m).reduce((map, next) => ({ ...map, [next._id]: next }), {});

  const [isExpanded, setIsExpanded] = useState(false);

  const shouldDisplayExpandIcon = !isProjectLoading && !workIsLoading && volumes.length > 0;

  const startAdornment = useMemo(() => {
    if (!shouldDisplayExpandIcon) return null;

    if (isExpanded) return <IconExpanded />;

    return <IconExpand />;
  }, [shouldDisplayExpandIcon, isExpanded]);

  const volumesMap = volumes.reduce(
    (acc, volumeItem) => ({
      volume: (acc.volume || 0) + (volumeItem.volume || 0),
      area: (acc.area || 0) + (volumeItem.area || 0),
      length: (acc.length || 0) + (volumeItem.length || 0),
      weight: (acc.weight || 0) + (volumeItem.weight || 0),
      quantity: (acc.quantity || 0) + (volumeItem.quantity || 0),
    }),
    { volume: 0, area: 0, length: 0, weight: 0, quantity: 0 }
  );

  return (
    <div className={classes.section}>
      <ContainerTitle tag="h3" title={formatMessage(messages['workDetails.volumes.title'])} padding="small" />

      <Table
        withStartAdornment={shouldDisplayExpandIcon}
        isLoading={workIsLoading || volumesIsLoading}
        loadingRowsCount={1}
        gridTemplate={GRID_TEMPLATE}
        headerContent={
          <TableHead variant="light">
            <Typography variant="caption">{formatMessage(messages['workDetails.volumes.table.name'])}</Typography>
            <Typography align="right" variant="caption" tooltip>
              {formatMessage(messages['workDetails.volumes.table.volume'])}
            </Typography>
            <Typography align="right" variant="caption" tooltip>
              {formatMessage(messages['workDetails.volumes.table.area'])}
            </Typography>
            <Typography align="right" variant="caption" tooltip>
              {formatMessage(messages['workDetails.volumes.table.length'])}
            </Typography>
            <Typography align="right" variant="caption" tooltip>
              {formatMessage(messages['workDetails.volumes.table.weight'])}
            </Typography>
            <Typography align="right" variant="caption" tooltip>
              {formatMessage(messages['workDetails.volumes.table.qty'])}
            </Typography>
          </TableHead>
        }
      >
        {isProjectLoading ? (
          <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} />
        ) : (
          <TableRow
            startAdornment={startAdornment}
            onClick={() => setIsExpanded(!isExpanded)}
            gridTemplate={GRID_TEMPLATE}
          >
            <div className={classes.icon}>
              <IconProject />
              <Typography noWrap tooltip>
                {project.name}
              </Typography>
            </div>
            <Typography variant="number" tooltip={ceil(volumesMap.volume, 2)}>
              {ceil(volumesMap.volume)}
            </Typography>
            <Typography variant="number" tooltip={ceil(volumesMap.area, 2)}>
              {ceil(volumesMap.area)}
            </Typography>
            <Typography variant="number" tooltip={ceil(volumesMap.length, 2)}>
              {ceil(volumesMap.length)}
            </Typography>
            <Typography variant="number" tooltip={ceil(volumesMap.weight, 2)}>
              {ceil(volumesMap.weight)}
            </Typography>
            <Typography variant="number" tooltip={ceil(volumesMap.quantity, 2)}>
              {ceil(volumesMap.quantity)}
            </Typography>
          </TableRow>
        )}

        {isExpanded &&
          volumes.map(model =>
            modelsDataMap[model.modelVersionId] ? (
              <TableRow
                withStartAdornment
                key={(modelsDataMap[model.modelVersionId] || {}).name}
                gridTemplate={GRID_TEMPLATE}
              >
                <Typography noWrap tooltip className={classes.iconShift}>
                  {(modelsDataMap[model.modelVersionId] || {}).name}
                </Typography>
                <Typography variant="number" tooltip={ceil(model.volume, 2)}>
                  {ceil(model.volume)}
                </Typography>
                <Typography variant="number" tooltip={ceil(model.area, 2)}>
                  {ceil(model.area)}
                </Typography>
                <Typography variant="number" tooltip={ceil(model.length, 2)}>
                  {ceil(model.length)}
                </Typography>
                <Typography variant="number" tooltip={ceil(model.weight, 2)}>
                  {ceil(model.weight)}
                </Typography>
                <Typography variant="number" tooltip={ceil(model.quantity, 2)}>
                  {ceil(model.quantity)}
                </Typography>
              </TableRow>
            ) : (
              <SkeletonGroup rowsCount={1} gridTemplate={GRID_TEMPLATE} />
            )
          )}
      </Table>
    </div>
  );
};

export { VolumesSection };
