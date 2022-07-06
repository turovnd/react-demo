import { all, put, call, takeEvery } from 'redux-saga/effects';
import api from '../../api';

import { addResBySpecificationActions } from '../slices';
import { processError } from '../../utils/processError';

function* searchRowsFlow({ payload: { elements, projectId, filters, limit = 100, offset = 0 } }) {
  try {
    const { rows, total } = yield call(api.specification.searchSpecifications, {
      projectId,
      elements,
      filters,
      offset,
      limit,
    });

    yield put(addResBySpecificationActions.searchRows.success({ rows, total, offset }));
  } catch (e) {
    yield processError(e, put(addResBySpecificationActions.searchRows.failed(e)));
  }
}

export default function* root() {
  yield all([takeEvery(addResBySpecificationActions.searchRows.types.BASE, searchRowsFlow)]);
}
