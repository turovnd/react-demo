import { all, put, call, takeEvery } from 'redux-saga/effects';
import api from '../../api';

import { orgRulesActions } from '../slices';
import { transformRules } from '../../utils/transformers';
import { processError } from '../../utils/processError';

function* searchRowsFlow({ payload: { projectId, unassigned, filters, limit = 100, offset = 0 } }) {
  try {
    const { rows, total } = yield call(api.elements.searchOrgRules, {
      projectId,
      unassigned,
      filters,
      limit,
      offset,
    });

    const transformedRules = transformRules(rows);

    yield put(orgRulesActions.searchRows.success({ rows: transformedRules, total, offset }));
  } catch (e) {
    yield processError(e, put(orgRulesActions.searchRows.failed(e)));
  }
}

export default function* root() {
  yield all([takeEvery(orgRulesActions.searchRows.types.BASE, searchRowsFlow)]);
}
