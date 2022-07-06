import { all, put, call, take, takeEvery, select, takeLatest } from 'redux-saga/effects';
import { HiddenNodesController } from '@demo/viewer-tools';
import api from '../../api';
import { externalActions, externalSelectors, wrapperActions, wrapperSelectors } from '../slices';

function* getStatsFlow({ payload: { projectId } }) {
  try {
    let isProjectBusy = yield select(externalSelectors.selectIsProjectSync);

    // Ждем пока пройдет синхронизация
    while (isProjectBusy) {
      const { payload } = yield take(externalActions.setProjectSync.types.BASE);
      isProjectBusy = payload;
    }

    const models = yield select(externalSelectors.selectModels);
    const modelsIds = models.map(model => model._id);

    const { hasWork, hasNotWork } = yield call(api.elements.getFiltersStats, projectId, modelsIds);

    yield put(wrapperActions.getStats.success({ hasWork, hasNotWork }));
  } catch (e) {
    if ((e.context || {}).status === 423) {
      yield put(wrapperActions.getStats.base({ projectId }));
    } else {
      yield put(wrapperActions.getStats.failed());
    }
  }
}

function cancelIsolation() {
  HiddenNodesController.disableFilter();
}

function* enableFilterFlow({ payload: { filter, projectId } }) {
  try {
    const FILTER_CALL_MAP = {
      hasWork: { filter: 'hasWork', value: true },
      hasNotWork: { filter: 'hasWork', value: false },
    };

    const models = yield select(externalSelectors.selectModels);
    const modelsIds = models.map(model => model._id);

    const elementsMap = yield call(api.elements.getFilterElements, {
      projectId,
      modelsIds,
      filters: [FILTER_CALL_MAP[filter]],
    });

    HiddenNodesController.enableFilter(elementsMap);

    yield put(wrapperActions.enableFilter.success({ filter }));
  } catch (e) {
    yield put(wrapperActions.enableFilter.failed(e));
  }
}

function devitalizeFlow() {
  HiddenNodesController.disableFilter();
}

function* reloadCurrentFilterFlow({ payload: { projectId } }) {
  const currentFilter = yield select(wrapperSelectors.selectSelectedFilterKey);

  if (!currentFilter) return;

  yield put(wrapperActions.disableFilter.base());
  yield put(wrapperActions.enableFilter.base({ projectId, filter: currentFilter }));
}

export default function* root() {
  yield all([
    takeEvery(wrapperActions.getStats.types.BASE, getStatsFlow),
    takeLatest(wrapperActions.enableFilter.types.BASE, enableFilterFlow),
    takeLatest(wrapperActions.disableFilter.types.BASE, cancelIsolation),
    takeLatest(wrapperActions.reloadCurrentFilter.types.BASE, reloadCurrentFilterFlow),
    takeLatest(wrapperActions.devitalize.types.BASE, devitalizeFlow),
  ]);
}
