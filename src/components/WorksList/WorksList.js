import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useFormatMessage } from '@demo/localization';
import { Container, Typography, RemoveDialog, ContainerTitle } from '@demo/bricks';
import { ClickController, ElementsSelectorCustomButtons, viewerUtils } from '@demo/viewer-tools';
import { isEmpty } from 'lodash';

import AutoSizer from 'react-virtualized-auto-sizer';
import { ELEMENTS_SELECTION_SELECT_KEY } from '@demo/elements-selection';
import { ElementsExpandPanel } from '../common/ElementsExpandPanel';
import { useStyles } from './WorksList.styles';
import { SearchField } from './SearchField';
import { CreateModal } from './CreateModal';
import {
  externalActions,
  externalSelectors,
  worksListActions,
  worksListSelectors,
  wrapperActions,
} from '../../redux/slices';
import { messages } from '../../localization';
import { WorksTable } from './WorksTable';
import { useDeepEffect } from '../../utils/useDeepEffect';

const WorksList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const msg = useFormatMessage(messages);

  const total = useSelector(worksListSelectors.selectTotal);
  const isLoading = useSelector(worksListSelectors.selectIsLoading);
  const isRemoving = useSelector(worksListSelectors.selectIsRemoving);
  const filters = useSelector(worksListSelectors.selectFilters);
  const isProjectLoaded = useSelector(externalSelectors.selectIsProjectLoading);

  const elementBrowserRef = useRef(null);
  const [isRuleEditing, setIsRuleEditing] = useState(false);
  const [isRuleSubmitting, setIsRuleSubmitting] = useState(false);
  const [selected, setSelected] = useState({ section: null, id: null, name: null });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [removeDialog, setRemoveDialog] = useState({ open: false, workId: '' });
  const [selectedViewerElements, setSelectedViewerElements] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    ClickController.addSelectListener('works-list-select-listener', (elementsMap, { key } = {}) => {
      if (key === ELEMENTS_SELECTION_SELECT_KEY || isRuleEditing) return;

      const elements = Object.values(elementsMap).reduce((acc, revitIdsArray) => acc.concat(revitIdsArray), []);
      setSelectedViewerElements(elements);

      if (isEmpty(elementsMap)) {
        setSelected({ section: null, id: null, name: null });
      }
    });
  }, [isProjectLoaded, isRuleEditing]);

  useEffect(() => () => ClickController.removeSelectListener('works-list-select-listener'), []);

  // Search new rows only once on params updated.
  useDeepEffect(() => {
    dispatch(
      worksListActions.searchRows.base({
        projectId,
        elements: selectedViewerElements,
        filters,
        reset: true,
      })
    );
  }, [filters, selectedViewerElements]);

  const showEmptyTableText = selectedViewerElements.length === 0 && filters.length === 0 && !isLoading && total === 0;
  const showEmptySelectionTableText = selectedViewerElements.length > 0 && !isLoading && total === 0;

  const loadMoreItems = (startIndex, stopIndex) => {
    dispatch(
      worksListActions.searchRows.base({
        projectId,
        filters,
        elements: selectedViewerElements,
        offset: startIndex,
        limit: stopIndex - startIndex,
      })
    );
  };

  const callbackAfterManageAggregations = () => {
    dispatch(externalActions.setProjectSync.base(true));
    dispatch(wrapperActions.getStats.base({ projectId }));
    dispatch(
      worksListActions.loadVolumes.base({
        projectId,
        elements: selectedViewerElements,
        worksMap: { [selected.id]: [] },
      })
    );
  };

  const handleSubmitNewRule = () => {
    if (elementBrowserRef.current.submitRule) {
      elementBrowserRef.current.submitRule({
        onStart: () => {
          setIsRuleSubmitting(true);
        },
        onSuccess: () => {
          setIsRuleEditing(false);
          setIsRuleSubmitting(false);
          callbackAfterManageAggregations();
        },
        onError: () => {
          setIsRuleSubmitting(false);
          dispatch(worksListActions.submitRule.failed());
        },
      });
    }
  };

  const handleCloseRuleEdit = () => {
    if (isRuleSubmitting) return;
    viewerUtils.selectByMap({});
    setIsRuleEditing(false);
  };

  return (
    <div className={classes.root}>
      <CreateModal isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
      <RemoveDialog
        isOpen={removeDialog.open}
        title={msg('worksList.removeWork.title')}
        text={msg('worksList.removeWork.message')}
        onClose={() => {
          if (isRemoving) return;
          setRemoveDialog({ open: false, workId: '' });
        }}
        onSubmit={() => {
          dispatch(
            worksListActions.removeWork.base({
              projectId,
              workId: removeDialog.workId,
              successMessage: msg('notifications.worksList.remove'),
            })
          );
        }}
      />

      <ContainerTitle
        tag="h1"
        padding="small"
        title={msg('worksList.title')}
        actions={[
          {
            hidden: isRuleEditing,
            label: msg('button.create'),
            variant: 'contained',
            color: 'primary',
            onClick: () => setIsAddDialogOpen(true),
          },
          {
            hidden: !isRuleEditing,
            label: msg('button.cancel'),
            variant: 'contained',
            onClick: () => {
              handleCloseRuleEdit();
            },
          },
          {
            hidden: !isRuleEditing,
            label: msg('button.save'),
            variant: 'contained',
            color: 'primary',
            loading: isRuleSubmitting,
            onClick: () => {
              if (isRuleSubmitting) return;
              handleSubmitNewRule();
            },
          },
        ]}
      />

      <Container paddingH="small">
        <SearchField />
      </Container>

      {(showEmptyTableText || showEmptySelectionTableText) && (
        <Typography style={{ height: '100%' }} align="center" color="hint" className={classes.emptyHint}>
          {showEmptyTableText && msg('worksList.emptyText')}
          {showEmptySelectionTableText && msg('worksList.emptySelectionText')}
        </Typography>
      )}

      {!(showEmptyTableText || showEmptySelectionTableText) && (
        <div className={classes.table}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <WorksTable
                height={height}
                setRemoveDialog={setRemoveDialog}
                loadMoreItems={loadMoreItems}
                filters={filters}
                selected={selected}
                setSelected={setSelected}
                panelExpanded={expanded}
                setPanelExpanded={setExpanded}
                setArtefactRuleEditingMode={setIsRuleEditing}
              />
            )}
          </AutoSizer>
        </div>
      )}

      <ElementsSelectorCustomButtons
        isOpen={Boolean(expanded && isRuleEditing)}
        // onAccept={handleSubmit}
        // acceptButtonProps={{ loading: isSubmitting }}
        onDecline={() => {
          if (isRuleSubmitting) return;
          viewerUtils.selectByMap({});
        }}
      />

      <ElementsExpandPanel
        staticExpand
        isExpanded={expanded}
        setIsExpanded={setExpanded}
        section={selected.section}
        rule={{
          ref: elementBrowserRef,
          hidden: !selected.id,
          isEditable: true,
          showEmpty: true,
        }}
        artefact={
          selected.id
            ? {
                id: selected.id,
                type: 'work',
                addRulesTypes: ['costPosition', 'specification'],
                withRules: true,
                name: selected.name,
                onRulesChange: callbackAfterManageAggregations,
              }
            : undefined
        }
        setArtefactRuleEditingMode={setIsRuleEditing}
        isArtefactRuleEditingMode={isRuleEditing}
      />
    </div>
  );
};

export { WorksList };
