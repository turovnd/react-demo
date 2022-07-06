import { all, select, put, call, takeEvery } from 'redux-saga/effects';

import { costsAllTableActions, costsCommonSelectors } from '../slices';
import api from '../../api';
import { processError } from '../../utils/processError';

function* searchRowsFlow({ payload: { projectId, filters, offset = 0, limit = 100 } }) {
  try {
    const { total, rows } = yield call(api.costs.searchCosts, {
      offset,
      limit,
      projectId,
      filters,
    });

    yield put(costsAllTableActions.searchRows.success({ rows, total, offset }));
  } catch (e) {
    yield processError(e, put(costsAllTableActions.searchRows.failed(e)));
  }
}

function* searchSectionsFlow({ payload: { projectId, costId } }) {
  try {
    const rows = yield call(api.costs.getCostSections, {
      projectId,
      costId,
    });

    yield put(costsAllTableActions.searchSections.success({ rows }));
  } catch (e) {
    yield processError(e, put(costsAllTableActions.searchSections.failed(e)));
  }
}

function* searchPositionsRowsFlow({ payload: { projectId, filters, offset = 0, limit = 100 } }) {
  try {
    const cost = yield select(costsCommonSelectors.selectCost);

    const { rows, total } = yield call(api.costs.searchCostPositions, {
      projectId,
      costId: cost._id,
      filters,
      offset,
      limit,
      onlyNorms: true,
    });

    const rowsWithCostDetails = rows.map(row => ({ ...row, costDetails: cost }));

    yield put(costsAllTableActions.searchPositionsRows.success({ rows: rowsWithCostDetails, total, offset }));
  } catch (e) {
    yield processError(e, put(costsAllTableActions.searchPositionsRows.failed(e)));
  }
}

export default function* root() {
  yield all([
    takeEvery(costsAllTableActions.searchRows.types.BASE, searchRowsFlow),
    takeEvery(costsAllTableActions.searchSections.types.BASE, searchSectionsFlow),
    takeEvery(costsAllTableActions.searchPositionsRows.types.BASE, searchPositionsRowsFlow),
  ]);
}
