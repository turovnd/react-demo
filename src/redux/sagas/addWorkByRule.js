import { all, put, call, takeEvery, select } from 'redux-saga/effects';
import api from '../../api';
import { transformRules } from '../../utils/transformers';

import { addWorkByRuleActions, addWorkByRuleSelectors, externalActions } from '../slices';
import { processError } from '../../utils/processError';

function* searchRowsFlow({ payload: { projectId, filters, limit = 100, offset = 0 } }) {
  try {
    const { rows, total } = yield call(api.elements.searchOrgRules, {
      unassigned: true,
      projectId,
      filters,
      offset,
      limit,
    });

    const transformedRules = transformRules(rows);

    yield put(addWorkByRuleActions.searchRows.success({ rows: transformedRules, total, offset }));
  } catch (e) {
    yield processError(e, put(addWorkByRuleActions.searchRows.failed(e)));
  }
}

function* submitWorksFlow({ payload: { projectId, onSuccess, successMessage } }) {
  try {
    const works = yield select(addWorkByRuleSelectors.selectSelectedWorks);

    const newWorks = yield call(api.works.createByTemplate, {
      projectId,
      worksIds: works,
    });

    const currentRules = yield select(addWorkByRuleSelectors.selectRows);
    const assignAggregationsRequest = {};

    currentRules.forEach(rule => {
      if (rule._id && rule.works) {
        rule.works.forEach(work => {
          if (work._id) {
            const newId = (newWorks.find(w => w.oldWorkId === work._id) || {}).newWorkId;
            if (newId) {
              assignAggregationsRequest[newId] = {
                assign: [...((assignAggregationsRequest[newId] || {}).assign || []), rule._id],
              };
            }
          }
        });
      }
    });

    yield call(api.elements.updateAggregationsToWork, { projectId, assignedMap: assignAggregationsRequest });

    yield all([
      put(addWorkByRuleActions.submitWorks.success()),
      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);

    onSuccess();
  } catch (e) {
    yield processError(e, put(addWorkByRuleActions.submitWorks.failed(e)));
  }
}

export default function* root() {
  yield all([
    takeEvery(addWorkByRuleActions.searchRows.types.BASE, searchRowsFlow),
    takeEvery(addWorkByRuleActions.submitWorks.types.BASE, submitWorksFlow),
  ]);
}
