import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { TableRow, TextField, Typography, Skeleton } from '@demo/bricks';
import { Remove as IconRemove, Circle as IconCircle, Warning as IconWarning } from '@demo/bricks/icons';
import { useIntl } from '@demo/localization';
import { ceil } from 'lodash';

import { workDetailsActions, workDetailsSelectors } from '../../../../redux/slices';
import { messages } from '../../../../localization';
import { RES_TYPES, SOURCE_TYPE } from '../../../../definitions';

const ResRow = React.memo(({ canEdit, resource, gridTemplate, unitKey, unitCoeff }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { projectId } = useParams();

  const volumes = useSelector(workDetailsSelectors.selectVolumes);
  let isVolumesLoading = useSelector(workDetailsSelectors.selectVolumesIsLoading);
  isVolumesLoading = isVolumesLoading || (!resource.workloadVolumes && resource.resType === RES_TYPES.project);

  const [consumption, setConsumption] = useState(resource.consumption || 0);

  useEffect(() => {
    if (resource.resType === RES_TYPES.project && !resource.workloadVolumes) {
      dispatch(workDetailsActions.loadSpecWithWorkload.base({ projectId, resource }));
    }
  }, [resource.resType]);

  const isProjectRes = resource.resType === RES_TYPES.project;

  unitKey = isProjectRes ? resource.quantityModelAttribute : unitKey;
  unitCoeff = isProjectRes ? 1 : unitCoeff;

  const { price = 0 } = resource;
  const workload = (volumes || []).reduce((acc, item) => acc + (item[unitKey] || 0), 0);

  let volumeConsumption = 0;
  if (isProjectRes && Object.keys((resource || {}).workloadVolumes || {}).includes(unitKey)) {
    volumeConsumption = (resource.workloadVolumes || {})[unitKey] * consumption;
  } else {
    volumeConsumption = (workload * consumption) / (unitCoeff || 1);
  }

  const isNoConsumption = !consumption || consumption === 0;
  const isWarningInRow = !consumption || consumption === 0 || price === 0;
  const consumptionTooltip = isNoConsumption ? formatMessage(messages['resources.emptyConsumption']) : true;

  const handleUpdateResConsumption = (customId, newConsumption) => {
    const numberConsumption = parseFloat(newConsumption);

    dispatch(
      workDetailsActions.updateResConsumption.base({
        customId,
        consumption: numberConsumption,
      })
    );
  };

  const handleRemoveRes = customId => {
    dispatch(workDetailsActions.removeResource.base({ customId }));
  };

  const baseName = useMemo(() => {
    if (resource.resType === RES_TYPES.project) {
      return formatMessage(messages['workDetails.resources.tableColBase.project']);
    }

    if (resource.details) {
      return `${resource.details.sourceRootCode || resource.details.sourceCode || resource.details.sourceName}`;
    }

    return formatMessage(messages['workDetails.resources.tableColBase.noBase']);
  }, [formatMessage, messages, resource]);

  return (
    <TableRow
      gridTemplate={gridTemplate}
      withStartAdornment
      startAdornment={isWarningInRow ? <IconCircle color="warning" size="small" /> : undefined}
      actions={[
        {
          hidden: !canEdit,
          startAdornment: <IconRemove />,
          label: formatMessage(messages['button.remove']),
          onClick: () => handleRemoveRes(resource.customId),
        },
      ]}
    >
      <Typography tooltip lineClamp={2}>
        {baseName}
      </Typography>

      <Typography tooltip lineClamp={2}>
        {resource.code} {resource.name}
      </Typography>

      <Typography tooltip lineClamp={2}>
        {resource.unit}
      </Typography>

      {canEdit && !isProjectRes && resource.source !== SOURCE_TYPE.COST_POSITION ? (
        <TextField
          type="number"
          value={consumption}
          onChange={e => setConsumption(e.target.value)}
          onBlur={() => handleUpdateResConsumption(resource.customId, consumption)}
        />
      ) : (
        <Typography variant="number" tooltip={isProjectRes ? undefined : consumptionTooltip}>
          {isProjectRes && '-'}
          {!isProjectRes && (isNoConsumption ? <IconWarning color="warning" /> : ceil(consumption, 2))}
        </Typography>
      )}

      {isVolumesLoading ? (
        <Skeleton height="min-content" />
      ) : (
        <Typography tooltip={isProjectRes ? undefined : ceil(workload, 2)} variant="number">
          {isProjectRes ? '-' : ceil(workload) || '-'}
        </Typography>
      )}

      {isVolumesLoading ? (
        <Skeleton height="min-content" />
      ) : (
        <Typography variant="number" tooltip numberRound={2}>
          {isNoConsumption ? '-' : ceil(volumeConsumption, 2)}
        </Typography>
      )}

      <Typography variant="number" tooltip={!price ? formatMessage(messages['resources.emptyPrice']) : ceil(price, 2)}>
        {price === 0 ? <IconWarning color="warning" /> : ceil(price)}
      </Typography>

      {isVolumesLoading ? (
        <Skeleton height="min-content" />
      ) : (
        <Typography variant="number" tooltip={ceil(price * volumeConsumption, 2)}>
          {ceil(price * volumeConsumption) || '-'}
        </Typography>
      )}
    </TableRow>
  );
});

ResRow.propTypes = {
  gridTemplate: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  unitKey: PropTypes.string.isRequired,
  unitCoeff: PropTypes.number.isRequired,
  resource: PropTypes.shape({
    code: PropTypes.string,
    resType: PropTypes.oneOf(Object.values(RES_TYPES)),
    consumption: PropTypes.string,
    customId: PropTypes.string,
    name: PropTypes.string,
    unit: PropTypes.string,
    price: PropTypes.number,
    source: PropTypes.string,
    workloadVolumes: PropTypes.shape({
      volume: PropTypes.number,
      area: PropTypes.number,
      length: PropTypes.number,
      weight: PropTypes.number,
      quantity: PropTypes.number,
      attributes: PropTypes.object,
    }),
    details: PropTypes.shape({
      sourceCode: PropTypes.string,
      sourceName: PropTypes.string,
      sourceRootCode: PropTypes.string,
    }),
    quantityModelAttribute: PropTypes.number,
  }).isRequired,
};

export { ResRow };
