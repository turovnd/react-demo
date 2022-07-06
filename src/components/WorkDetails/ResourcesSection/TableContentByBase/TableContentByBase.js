import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableRow, Typography } from '@demo/bricks';
import { groupBy } from 'lodash';
import { ChevronDown as IconExpand, ChevronUp as IconCollapse } from '@demo/bricks/icons';
import { useIntl } from '@demo/localization';

import { ResRow } from '../ResRow';
import { ResTable } from '../ResTable';
import { ResTypeRow } from '../ResTypeRow';
import { messages } from '../../../../localization';
import { useStyles } from './TableContentByBase.styles';
import { workDetailsSelectors } from '../../../../redux/slices';
import { RES_TYPES } from '../../../../definitions';

const TableContentByBase = ({ canEdit, searchQuery, gridTemplate, workDetails }) => {
  const classes = useStyles();
  const { formatMessage } = useIntl();

  const rows = useSelector(workDetailsSelectors.selectResourcesByBase);

  const [expanded, setExpanded] = useState([]);

  const toggleGroup = groupName => {
    const targetIndex = expanded.indexOf(groupName);
    if (targetIndex > -1) {
      setExpanded(expanded.filter(id => id !== groupName));
    } else {
      setExpanded([...expanded, groupName]);
    }
  };

  return (
    <Fragment>
      {Object.entries(rows).map(([groupName, resources]) => {
        const isWithoutBase = !groupName || groupName === 'undefined' || groupName === 'undefined undefined';
        const isProjectMaterials = groupName === '_project';

        const isExpanded = expanded.includes(groupName);

        const shouldDisplayWithCurrentSearch = resources.some(
          res =>
            (res.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (res.code || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (!shouldDisplayWithCurrentSearch && !isProjectMaterials) return null;

        const title = () => {
          if (isWithoutBase) return formatMessage(messages['resTypes.noBase']);
          if (isProjectMaterials) return formatMessage(messages['resTypes.project']);
          return groupName;
        };

        return (
          <Fragment>
            <div onClick={() => toggleGroup(groupName)} className={classes.normHeader}>
              <Typography variant="subtitle" weight="medium" noWrap>
                {title()}
              </Typography>
              {isExpanded ? <IconCollapse /> : <IconExpand />}
            </div>

            {isExpanded && (
              <ResTable gridTemplate={gridTemplate} workDetails={workDetails}>
                {(isProjectMaterials && resources.length === 0
                  ? // If project materials table is empty - show that table with template
                    Object.entries({ [RES_TYPES.project]: [] })
                  : // Else show resources grouped by type.
                    Object.entries(groupBy(resources, 'resType'))
                ).map(([resType, resourcesByTypes]) => {
                  const filteredResRows = resourcesByTypes.filter(
                    row =>
                      (row.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (row.code || '').toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  return (
                    <Fragment key={resType}>
                      {/* Display only if not the project materials table.  */}
                      {!isProjectMaterials && <ResTypeRow canEdit={false} resType={resType} />}

                      {filteredResRows.length > 0 ? (
                        filteredResRows.map(resource => (
                          <ResRow
                            key={resource.customId + (workDetails || {}).unitKey + (workDetails || {}).unitCoeff}
                            unitKey={(workDetails || {}).unitKey}
                            unitCoeff={(workDetails || {}).unitCoeff}
                            canEdit={canEdit}
                            gridTemplate={gridTemplate}
                            resource={resource}
                          />
                        ))
                      ) : (
                        <TableRow noHover centered>
                          <Typography align="center">
                            {formatMessage(
                              messages[
                                searchQuery.length > 0
                                  ? 'workDetails.resources.table.emptyByFilter'
                                  : 'workDetails.resources.table.empty'
                              ]
                            )}
                          </Typography>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </ResTable>
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

TableContentByBase.propTypes = {
  gridTemplate: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string,
  workDetails: PropTypes.object.isRequired,
};

TableContentByBase.defaultProps = {
  searchQuery: '',
};

export { TableContentByBase };
