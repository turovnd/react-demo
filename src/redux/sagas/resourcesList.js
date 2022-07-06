import { all, put, call, takeEvery, select } from 'redux-saga/effects';
import api from '../../api';

import { resourcesListActions, externalActions, resourcesListSelectors } from '../slices';
import { processError } from '../../utils/processError';

function* getRowsAfterBusy({ payload }) {
  const projectId = yield select(resourcesListSelectors.selectProjectId);
  const elements = yield select(resourcesListSelectors.selectElements);
  const filters = yield select(resourcesListSelectors.selectFilters);
  const offset = yield select(resourcesListSelectors.selectOffset);
  if (!payload && projectId && window.location.pathname.includes('/resources')) {
    try {
      const { rows, total } = yield call(api.works.searchResources, {
        projectId,
        elements,
        filters,
        offset,
        limit: 100,
      });
      yield put(
        resourcesListActions.searchRows.success({ rows, total, offset, isBusy: false, projectId, filters, elements })
      );
    } catch (e) {
      yield processError(e, put(resourcesListActions.searchRows.failed(e)));
    }
  }
}

function* searchRowsFlow({ payload: { projectId, elements, filters, limit = 100, offset = 0 } }) {
  try {
    const { rows, total, isBusy } = yield call(api.works.searchResources, {
      projectId,
      elements,
      filters,
      offset,
      limit,
    });

    if (isBusy) yield put(externalActions.setProjectSync.base(true));
    yield put(resourcesListActions.searchRows.success({ rows, total, offset, isBusy, projectId, filters, elements }));
  } catch (e) {
    yield processError(e, put(resourcesListActions.searchRows.failed(e)));
  }
}

export default function* root() {
  yield all([takeEvery(resourcesListActions.searchRows.types.BASE, searchRowsFlow)]);
  yield all([takeEvery(externalActions.setProjectSync.types.BASE, getRowsAfterBusy)]);
}
