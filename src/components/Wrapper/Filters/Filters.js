import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FilterToolbarItem } from '@demo/viewer-tools';
import { useFormatMessage } from '@demo/localization';
import { Worker as IconCube, WorkerCrossed as IconCubeCrossedOut } from '@demo/bricks/icons';
import { messages } from '../../../localization';
import { externalSelectors, wrapperActions, wrapperSelectors } from '../../../redux/slices';

const ICONS_MAP = {
  hasWork: <IconCube />,
  hasNotWork: <IconCubeCrossedOut />,
};

const Filters = () => {
  const dispatch = useDispatch();
  const msg = useFormatMessage(messages);
  const { projectId } = useParams();

  const { hasWork, hasNotWork } = useSelector(wrapperSelectors.selectStats);
  const isFiltersLoading = useSelector(wrapperSelectors.selectIsStatsLoading);
  const loadingElementsFilter = useSelector(wrapperSelectors.selectLoadingFilterKey);
  const selectedFilterKey = useSelector(wrapperSelectors.selectSelectedFilterKey);
  const models = useSelector(externalSelectors.selectModels);
  const isProjectBusy = useSelector(externalSelectors.selectIsProjectSync);

  useEffect(() => {
    if (models.length > 0 && projectId) {
      dispatch(wrapperActions.getStats.base({ projectId }));
    }
  }, [projectId, models]);

  const getHasWork = () => {
    if (hasWork) {
      return hasWork;
    }

    return 0;
  };

  const getHasNotWork = () => {
    if (hasNotWork) {
      return hasNotWork;
    }

    return 0;
  };

  const handleSelectFilter = filter => {
    if (selectedFilterKey === filter) {
      dispatch(wrapperActions.disableFilter.base());
    } else {
      dispatch(
        wrapperActions.enableFilter.base({
          projectId,
          filter,
        })
      );
    }
  };

  return (
    <Fragment>
      <FilterToolbarItem
        onClick={() => (isProjectBusy ? undefined : handleSelectFilter('hasWork'))}
        isActive={selectedFilterKey === 'hasWork'}
        isLoading={isFiltersLoading}
        showSpinner={loadingElementsFilter === 'hasWork'}
        filterValue={getHasWork()}
        icon={ICONS_MAP.hasWork}
        tooltip={msg('wrapper.filter.hasWork')}
      />

      <FilterToolbarItem
        onClick={() => (isProjectBusy ? undefined : handleSelectFilter('hasNotWork'))}
        isActive={selectedFilterKey === 'hasNotWork'}
        isLoading={isFiltersLoading}
        showSpinner={loadingElementsFilter === 'hasNotWork'}
        filterValue={getHasNotWork()}
        icon={ICONS_MAP.hasNotWork}
        tooltip={msg('wrapper.filter.hasNotWork')}
      />
    </Fragment>
  );
};

export { Filters };
