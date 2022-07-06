import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { viewerUtils } from '@demo/viewer-tools';
import { ContainerTitle, Skeleton, Table, TableRow, Typography } from '@demo/bricks';
import {
  Add as IconAdd,
  Math as IconCosts,
  Book as IconSpec,
  Remove as IconRemove,
  Edit as IconEdit,
} from '@demo/bricks/icons';
import { useFormatMessage } from '@demo/localization';
import { AddRulesDialog } from '@demo/elements-selection';

import { externalActions, workDetailsActions, workDetailsSelectors } from '../../../redux/slices';
import { useStyles } from './AggregationsSection.styles';
import { WorkElemRules } from './WorkElemRules';
import { messages } from '../../../localization';
import { COLOR_RULE } from '../../../definitions';
import { EmptyDetailsSection } from '../../common/EmptyDetailsSection';
import { getRuleDisplayString } from '../../../utils/getRuleDisplayString';
import { getRuleKeywords } from '../../../utils/getRuleKeywords';

const AggregationsSection = ({ isCreating, canEdit, onSelect, selected, isAggrOpen, setIsAggrOpen, values }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const msg = useFormatMessage(messages);

  const aggregations = useSelector(workDetailsSelectors.selectAggregations);
  const updatingIndex = useSelector(workDetailsSelectors.selectUpdatingAggregationIndex);
  const isAdding = useSelector(workDetailsSelectors.selectIsAggregationAdding);
  const isLoading = useSelector(workDetailsSelectors.selectIsLoading);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [artefactType, setArtefactType] = useState('');

  const openAggregationEdit = index => {
    // For edit existed rule - set in store.
    if (Number.isInteger(index)) {
      setEditingIndex(index);
    } else {
      setEditingIndex(-1);
    }

    viewerUtils.selectByMap({});
    setIsAggrOpen(true);
  };

  const handleImportRule = selectedRules => {
    dispatch(workDetailsActions.setAggregations.base(selectedRules));
    dispatch(workDetailsActions.syncVolumes.base({ projectId }));

    dispatch(
      externalActions.showNotification.base({
        message: msg('notifications.workDetails.createAggregation'),
        variant: 'success',
      })
    );
    setArtefactType('');
  };

  return (
    <Fragment>
      <WorkElemRules
        isCreating={isCreating}
        setEditingIndex={setEditingIndex}
        editingIndex={editingIndex}
        isOpen={isAggrOpen}
        setIsOpen={setIsAggrOpen}
        name={values.name}
      />

      <AddRulesDialog
        isOpen={Boolean(artefactType)}
        onAccept={handleImportRule}
        onDecline={() => setArtefactType('')}
        isSubmitting={false}
        artefactType={artefactType}
        projectId={projectId}
        initialValue={aggregations}
      />

      <div className={classes.section}>
        <ContainerTitle
          tag="h3"
          title={msg('workDetails.rules.title')}
          padding="small"
          actions={[
            {
              hidden: !canEdit,
              label: '_Add',
              icon: <IconAdd />,
              menu: [
                {
                  label: msg('button.add'),
                  onClick: () => openAggregationEdit(),
                  startAdornment: <IconAdd />,
                },
                {
                  label: msg('workDetails.rules.addFromCost'),
                  onClick: () => setArtefactType('costPosition'),
                  startAdornment: <IconCosts />,
                },
                {
                  label: msg('workDetails.rules.addFromSpec'),
                  onClick: () => setArtefactType('specification'),
                  startAdornment: <IconSpec />,
                },
              ],
            },
          ]}
        />

        {aggregations.length === 0 ? (
          <EmptyDetailsSection canEdit={canEdit} />
        ) : (
          <Table gridTemplate={['1fr']} isLoading={isLoading} withActions>
            {aggregations.map((agr, index) => {
              if (updatingIndex === index) {
                return (
                  <TableRow withActions>
                    <Skeleton />
                  </TableRow>
                );
              }

              const isSelected = selected.includes(agr._id);
              const displayString = getRuleDisplayString(agr, msg);
              const mark = { [COLOR_RULE]: getRuleKeywords(agr, msg) };

              return (
                <TableRow
                  onClick={() => (isSelected ? onSelect([]) : onSelect([agr]))}
                  selected={isSelected}
                  actions={[
                    {
                      hidden: !canEdit,
                      startAdornment: <IconEdit />,
                      label: msg('button.edit'),
                      onClick: () => openAggregationEdit(index),
                    },
                    {
                      hidden: !canEdit,
                      startAdornment: <IconRemove />,
                      label: msg('button.remove'),
                      onClick: () =>
                        dispatch(
                          workDetailsActions.removeAggregation.base({
                            projectId,
                            aggregationId: agr._id,
                          })
                        ),
                    },
                  ]}
                >
                  <Typography noWrap mark={mark} tooltip={<Typography mark={mark}>{displayString}</Typography>}>
                    {displayString}
                  </Typography>
                </TableRow>
              );
            })}

            {isAdding && (
              <TableRow withActions>
                <Skeleton />
              </TableRow>
            )}
          </Table>
        )}
      </div>
    </Fragment>
  );
};

AggregationsSection.propTypes = {
  canEdit: PropTypes.bool,
  isAggrOpen: PropTypes.bool,
  onSelect: PropTypes.func,
  setIsAggrOpen: PropTypes.func,
  selected: PropTypes.array,
  isCreating: PropTypes.bool,
  values: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

AggregationsSection.defaultProps = {
  canEdit: false,
  isAggrOpen: false,
  onSelect: () => {},
  setIsAggrOpen: () => {},
  selected: [],
  isCreating: false,
};

export { AggregationsSection };
