import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import { TableRow } from '@demo/bricks';
import { workDetailsSelectors } from '../../../../redux/slices';
import { ResTable } from '../ResTable';
import { ResRow } from '../ResRow';
import { ResTypeRow } from '../ResTypeRow';
import { RES_TYPES } from '../../../../definitions';
import { EmptyDetailsSection } from '../../../common/EmptyDetailsSection';

const TableContentByRes = ({ canEdit, searchQuery, gridTemplate, workDetails }) => {
  const rows = useSelector(workDetailsSelectors.selectResourcesByType);

  return (
    <ResTable gridTemplate={gridTemplate} workDetails={workDetails}>
      {Object.keys(RES_TYPES).map(resType => {
        const resRows = rows[resType] || [];

        const filteredResRows = resRows.filter(
          row =>
            (row.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (row.code || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <Fragment key={resType}>
            {/* Title group */}
            <ResTypeRow canEdit={canEdit} resType={resType} />

            {/* Rows */}
            {filteredResRows.length > 0 ? (
              filteredResRows.map(resource => (
                <ResRow
                  key={resource.customId + (workDetails || {}).unitKey + (workDetails || {}).unitCoeff}
                  canEdit={canEdit}
                  gridTemplate={gridTemplate}
                  resource={resource}
                  unitKey={(workDetails || {}).unitKey}
                  unitCoeff={(workDetails || {}).unitCoeff}
                />
              ))
            ) : (
              <TableRow noHover centered>
                <EmptyDetailsSection canEdit={canEdit} />
              </TableRow>
            )}
          </Fragment>
        );
      })}
    </ResTable>
  );
};

TableContentByRes.propTypes = {
  gridTemplate: PropTypes.array.isRequired,
  workDetails: PropTypes.object.isRequired,
  searchQuery: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
};

TableContentByRes.defaultProps = {
  searchQuery: '',
};

export { TableContentByRes };
