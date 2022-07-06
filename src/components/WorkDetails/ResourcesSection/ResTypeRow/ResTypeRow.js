import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  AccountCircle as IconWorker,
  Gear as IconMachinery,
  Materials as IconMaterial,
  Add as IconAdd,
} from '@demo/bricks/icons';
import { IconButton, TableRow, Typography } from '@demo/bricks';
import { useIntl } from '@demo/localization';

import { RES_TYPES } from '../../../../definitions';
import { messages } from '../../../../localization';
import { addResBySpecificationActions, workDetailsActions } from '../../../../redux/slices';

const ResTypeRow = React.memo(({ canEdit, resType }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const startAdornment = useMemo(() => {
    if (resType === RES_TYPES.worker) {
      return <IconWorker />;
    }
    if (resType === RES_TYPES.machinery) {
      return <IconMachinery />;
    }
    if (resType === RES_TYPES.material) {
      return <IconMaterial />;
    }
    if (resType === RES_TYPES.project) {
      return <IconMaterial />;
    }

    return null;
  }, [resType]);

  const handleAddRes = () => {
    if (resType === RES_TYPES.project) {
      dispatch(addResBySpecificationActions.setIsOpen.base(true));
    } else {
      dispatch(
        workDetailsActions.setIsAddByCatalogOpen.base({
          isOpen: true,
          initialResType: formatMessage(messages[`resTypes.filter.${resType}`]),
        })
      );
    }
  };

  return (
    <TableRow
      noHover
      centered
      gridTemplate={['1fr']}
      startAdornment={startAdornment}
      endAdornment={
        canEdit ? (
          <IconButton size="small" onClick={handleAddRes}>
            <IconAdd />
          </IconButton>
        ) : undefined
      }
    >
      <Typography>{formatMessage(messages[`resTypes.${resType}`])}</Typography>
    </TableRow>
  );
});

ResTypeRow.propTypes = {
  resType: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export { ResTypeRow };
