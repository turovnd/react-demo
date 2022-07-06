import { take, select, all, put, call, takeEvery, takeLatest } from 'redux-saga/effects';
import { uniq } from 'lodash';

import api from '../../api';
import { worksListActions, externalActions, wrapperActions, externalSelectors } from '../slices';
import { processError } from '../../utils/processError';

function* searchRowsFlow({ payload: { elements, projectId, filters, limit = 50, offset = 0, reset } }) {
  try {
    const { rows, total } = yield call(api.works.searchWorks, {
      projectId,
      elements,
      filters,
      offset,
      limit,
    });

    yield put(worksListActions.searchRows.success({ rows, total, offset }));

    if (rows.length > 0) {
      yield put(
        worksListActions.loadVolumes.base({
          projectId,
          reset,
          elements,
          worksMap: (rows || []).reduce(
            (map, work) => ({
              ...map,
              [work._id]: (work.resources || [])
                .filter(r => r.source === 'specification')
                .map(r => (r.details || {}).specificationId)
                .filter(r => !!r),
            }),
            {}
          ),
        })
      );
    }
  } catch (e) {
    yield processError(e, put(worksListActions.searchRows.failed(e)));
  }
}

function* removeRowFlow({ payload: { projectId, workId, successMessage } }) {
  try {
    yield call(api.works.removeWork, {
      projectId,
      workId,
    });

    yield all([
      put(worksListActions.removeWork.success({ workId })),

      // Update filters.
      put(wrapperActions.getStats.base({ projectId })),

      // Update filters elements in viewer.
      put(wrapperActions.reloadCurrentFilter.base({ projectId })),

      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);
  } catch (e) {
    yield processError(e, put(worksListActions.removeWork.failed(e)));
  }
}

function* loadModelsData(rows, projectId) {
  const models = uniq(
    Object.values(rows).reduce((arr, modelsList) => arr.concat(modelsList.map(m => m.modelVersionId) || []), [])
  );
  yield put(externalActions.loadModels.base({ projectId, ids: models }));
}

function* loadVolumesFlow({ payload: { elements, projectId, worksMap } }) {
  try {
    let isProjectBusy = yield select(externalSelectors.selectIsProjectSync);

    // Ждем пока пройдет синхронизация
    while (isProjectBusy) {
      const { payload } = yield take(externalActions.setProjectSync.types.BASE);
      isProjectBusy = payload;
    }

    const data = yield call(api.elements.getVolumesByWorks, {
      projectId,
      works: Object.keys(worksMap),
      revitIds: elements,
      resourceVolumes: true,
    });

    yield put(worksListActions.loadVolumes.success({ data, worksMap }));
    yield loadModelsData(data, projectId);
  } catch (e) {
    yield processError(e, put(worksListActions.loadVolumes.failed({ worksMap })));
  }
}

export default function* root() {
  yield all([
    takeLatest(worksListActions.searchRows.types.BASE, searchRowsFlow),
    takeEvery(worksListActions.removeWork.types.BASE, removeRowFlow),
    takeEvery(worksListActions.loadVolumes.types.BASE, loadVolumesFlow),
  ]);
}
