import { select, all, put, call, takeEvery, takeLatest } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { store } from '@demo/store';
import { isEmpty, isEqual } from 'lodash';
import api from '../../api';
import { I18N_UNITS } from '../../definitions';
import { processError } from '../../utils/processError';
import {
  workDetailsActions,
  workDetailsSelectors,
  externalActions,
  wrapperActions,
  externalSelectors,
} from '../slices';
import {
  transformAggregations,
  transformCostsResources,
  transformNormsResources,
  transformResourcesForWorkSubmit,
  transformWorkResources,
} from '../../utils/transformers';
import { suggestLoadModels } from '../../utils/suggestLoadModels';

function* getWorkAggregations(projectId, workId) {
  try {
    const agrResp = yield call(api.elements.searchWorkAggregations, {
      projectId,
      workId,
    });

    // Received from backend aggregations is already assigned to work.
    return transformAggregations(agrResp);
  } catch (error) {
    if ((error.response || {}).status === 404) {
      return [];
    }
  }

  return [];
}

/**
 * Use after add and update aggregations, to get current volumes.
 */
function* syncVolumesFlow({ payload: { msg = null, projectId } }) {
  try {
    const aggregations = yield select(workDetailsSelectors.selectAggregations);
    const aggregationsIds = aggregations.map(a => a._id);

    let isBusy = true;
    let volumes = [];

    while (isBusy && aggregationsIds.length) {
      yield delay(5000);

      try {
        volumes = yield call(api.elements.getVolumesByAggregations, { aggregationsIds, projectId });

        if (volumes !== 'Busy') {
          isBusy = false;
        }

        if (msg) {
          const volumesModelsIds = volumes.map(v => v.modelVersionId);
          const storeModels = yield select(externalSelectors.selectModels);
          const storeModelsIds = storeModels.map(m => m._id);
          if (volumesModelsIds.some(modelId => !storeModelsIds.includes(modelId))) {
            suggestLoadModels(msg, store.dispatch, projectId, volumesModelsIds);
          }
        }
      } catch (e) {
        // Skip any error, and continue with new while iteration.
      }
    }

    yield put(externalActions.loadModels.base({ projectId, ids: volumes.map(v => v.modelVersionId) }));
    yield put(workDetailsActions.syncVolumes.success({ volumes }));
  } catch (e) {
    yield put(workDetailsActions.syncVolumes.failed(e));
  }
}

function* getSpecRowAggregation(projectId, resourceId) {
  let specRowAggregations;

  try {
    specRowAggregations = yield call(api.elements.searchSpecificationAggregations, {
      projectId,
      specificationId: resourceId,
    });
  } catch (e) {
    specRowAggregations = [];
  }

  return specRowAggregations;
}

export function* loadSpecWithWorkloadFlow({ payload: { projectId, resource } }) {
  try {
    const aggregations = yield select(workDetailsSelectors.selectAggregations);
    const specRowAggregations = yield getSpecRowAggregation(projectId, resource.details.specificationId);

    let volumes = {};
    let unitData = {};

    if (specRowAggregations.length > 0 && aggregations.length > 0) {
      [volumes, unitData] = yield all([
        call(api.elements.getVolumesForSpecifications, {
          projectId,
          specAgrIds: Array.from(new Set(specRowAggregations.map(agr => agr._id))),
          workAgrIds: Array.from(new Set(aggregations.map(agr => agr._id))),
        }),
        call(api.norms.getUnitData, { unitText: resource.unit }),
      ]);
    } else {
      unitData = yield call(api.norms.getUnitData, { unitText: resource.unit });
    }

    yield put(
      workDetailsActions.loadSpecWithWorkload.success({
        ...resource,
        quantityModelAttribute: resource.details.attribute || unitData.unitKey,
        workloadVolumes: volumes,
      })
    );
  } catch (error) {
    yield put(workDetailsActions.loadSpecWithWorkload.failed(error));
  }
}

function* getWorkDetailsFlow({ payload: { msg, projectId, workId } }) {
  try {
    const [details, costs, aggregations] = yield all([
      call(api.works.getWorkById, { projectId, workId }),
      call(api.costs.getLinkedWorkCosts, { projectId, workId }),
      getWorkAggregations(projectId, workId),
    ]);

    const transformedDetails = {
      name: details.name,
      code: details.code,
      unitKey: details.unitKey,
      unitCoeff: details.unitCoeff,
      type: details.type,
      section: details.section,
    };

    yield put(
      workDetailsActions.getWorkDetails.success({
        details: transformedDetails,
        aggregations,
        costs,
        resources: transformWorkResources(details.resources),
      })
    );

    yield put(workDetailsActions.syncVolumes.base({ msg, projectId }));
  } catch (e) {
    yield processError(e, put(workDetailsActions.getWorkDetails.failed(e)));
  }
}

function* syncCostPositions(projectId, workId) {
  const hasChanged = yield select(workDetailsSelectors.selectIsCostPositionsChanged);
  if (!hasChanged) return;

  const selectedCosts = yield select(workDetailsSelectors.selectCosts);

  yield call(api.costs.attachPositionsToWork, {
    projectId,
    workId,
    positionsIds: selectedCosts.map(cost => cost._id),
  });
}

function* syncAggregations(projectId, workId) {
  const initialRules = yield select(workDetailsSelectors.selectInitialAggregations);
  const rules = yield select(workDetailsSelectors.selectAggregations);

  if (isEqual(initialRules, rules)) return;

  const initialRulesIds = initialRules.map(agr => agr._id);
  const rulesIds = rules.map(agr => agr._id);
  const deletedRulesIds = initialRulesIds.filter(initialRuleId => !rulesIds.includes(initialRuleId));

  // Используем запрос для обновления правил  в работе
  const assignedMap = {};

  if (deletedRulesIds.length > 0) {
    assignedMap[workId] = { ...(assignedMap[workId] || {}), unassign: deletedRulesIds };
  }
  if (rulesIds.length > 0) {
    assignedMap[workId] = { ...(assignedMap[workId] || {}), assign: rulesIds };
  }

  if (!isEmpty(assignedMap)) {
    yield call(api.elements.updateAggregationsToWork, {
      projectId,
      assignedMap,
    });

    yield put(externalActions.setProjectSync.base(true));
    yield put(workDetailsActions.refreshInitialAggregations.base());
    if (deletedRulesIds.length > 0) {
      yield put(workDetailsActions.syncVolumes.base({ projectId }));
    }
  }
}

function* syncResources(projectId, workId) {
  const currentRes = yield select(workDetailsSelectors.selectResources);

  yield call(api.works.setResourcesToWork, {
    projectId,
    workId,
    resourcesMap: transformResourcesForWorkSubmit(currentRes),
  });
}

function* getCurrentParamsUnitId(unitCoeff, unitKey) {
  const unitLabel = I18N_UNITS.find(u => u.value === unitKey).key;
  const { _id: unitId } = yield call(api.norms.getUnitData, { unitLabel, unitCoeff });
  return unitId;
}

function* createWorkFlow({ payload: { projectId, values, onSuccess, successMessage, onFinally } }) {
  try {
    const selectedResources = yield select(workDetailsSelectors.selectResources);
    const unitId = yield getCurrentParamsUnitId(values.unitCoeff, values.unitKey);

    // Create work with base, costs and resources info.
    const { _id: workId, name: workName } = yield call(api.works.createWork, {
      projectId,
      work: {
        unitId,
        name: values.name,
        code: values.code,
        section: values.section,
        type: values.type,
        resourcesMap: transformResourcesForWorkSubmit(selectedResources),
      },
    });

    yield all([
      // Update attached costs.
      syncCostPositions(projectId, workId),

      // Add to work not assigned aggregations and update edited aggregations.
      syncAggregations(projectId, workId, workName),

      // Update filters.
      put(wrapperActions.getStats.base({ projectId })),

      // Update filters elements in viewer.
      put(wrapperActions.reloadCurrentFilter.base({ projectId })),
    ]);

    // Need prev yield results.
    yield put(workDetailsActions.syncVolumes.base({ projectId }));

    yield put(
      externalActions.showNotification.base({
        message: successMessage,
        variant: 'success',
      })
    );

    onSuccess(workId);
  } catch (e) {
    yield processError(e, put(workDetailsActions.createWork.failed(e)));
  } finally {
    onFinally();
  }
}

function* editWorkFlow({ payload: { projectId, values, workId, successMessage, onFinally } }) {
  try {
    const defaultUnitLabel = I18N_UNITS.find(u => u.value === values.unitKey);

    const { _id } = yield call(api.norms.getUnitData, {
      unitLabel: defaultUnitLabel.key,
      unitCoeff: values.unitCoeff,
    });

    // Update base work info.
    const { name: workName } = yield call(api.works.updateWork, {
      projectId,
      workId,
      work: {
        unitId: _id,
        type: values.type,
        section: values.section,
        name: values.name,
        code: values.code,
      },
    });

    yield all([
      // Update attached costs.
      syncCostPositions(projectId, workId),

      // Add to work not assigned aggregations and update edited aggregations.
      syncAggregations(projectId, workId, workName),

      // Create/update/delete changed resources.
      syncResources(projectId, workId),

      // Update filters values.
      put(wrapperActions.getStats.base({ projectId })),

      // Update filters elements in viewer.
      put(wrapperActions.reloadCurrentFilter.base({ projectId })),
    ]);

    yield all([
      put(workDetailsActions.editWork.success()),
      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);
  } catch (e) {
    yield processError(e, put(workDetailsActions.editWork.failed(e)));
  } finally {
    onFinally();
  }
}

const filterAggregationSelection = (aggregation = {}) => {
  const selection = { ...(aggregation.selection || {}) };
  if (selection.conditions) {
    selection.conditions = selection.conditions.filter(c =>
      Array.isArray(c.value) ? (c.value || []).length > 0 : true
    );
  }
  return selection;
};

function* addAggregationFlow({ payload: { projectId, aggregation, successMessage, onSuccess } }) {
  try {
    const createdAggregation = yield call(
      api.elements.createAggregation,
      filterAggregationSelection(aggregation),
      projectId
    );

    const transformedAgr = transformAggregations([createdAggregation])[0];

    yield all([
      put(workDetailsActions.addAggregation.success({ aggregation: transformedAgr })),
      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);

    if (onSuccess) {
      onSuccess();
    }

    yield put(workDetailsActions.syncVolumes.base({ projectId }));
  } catch (e) {
    yield processError(e, put(workDetailsActions.addAggregation.failed(e)));
  }
}

function* updateAggregationFlow({ payload: { projectId, aggregation, successMessage } }) {
  try {
    yield call(api.elements.updateAggregation, aggregation._id, filterAggregationSelection(aggregation), projectId);

    yield all([
      put(workDetailsActions.updateAggregation.success()),
      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);

    yield put(workDetailsActions.syncVolumes.base({ projectId }));
  } catch (e) {
    yield processError(e, put(workDetailsActions.updateAggregation.failed(e)));
  }
}

function* removeAggregationFlow({ payload: { projectId } }) {
  yield put(workDetailsActions.syncVolumes.base({ projectId }));
}

/**
 * Get cost resources on select costs.
 */
function* setWorkCostsFlow({ payload: { projectId, costs, successMessage } }) {
  try {
    const costsResources = yield call(api.costs.getCostPositionsResources, {
      projectId,
      costPositionIds: costs.map(c => c._id),
    });

    const transformedCostResources = transformCostsResources(costsResources);

    yield all([
      put(workDetailsActions.setWorkCosts.success({ resources: transformedCostResources })),
      put(
        externalActions.showNotification.base({
          message: successMessage,
          variant: 'success',
        })
      ),
    ]);
  } catch (e) {
    yield processError(e);
  }
}

function* addWorkResourcesByNormFlow({ payload: { norms } }) {
  try {
    const normsData = yield call(
      api.norms.getNormsData,
      norms.map(n => n._id)
    );
    const resources = transformNormsResources(normsData);

    yield put(workDetailsActions.addWorkResourcesByNorm.success({ resources }));
  } catch (e) {
    yield processError(e);
  }
}

function* addWorkResourcesBySpecificationFlow({ payload: { resources } }) {
  try {
    const data = yield call(api.resource.getResCodes, {
      resIds: resources.map(res => res.resId),
    });

    yield put(workDetailsActions.addWorkResourcesBySpecification.success({ resources, resCodesMap: data || {} }));
  } catch (e) {
    yield processError(e, put(workDetailsActions.addWorkResourcesBySpecification.failed(e)));
  }
}

export default function* root() {
  yield all([
    takeEvery(workDetailsActions.getWorkDetails.types.BASE, getWorkDetailsFlow),
    takeLatest(workDetailsActions.syncVolumes.types.BASE, syncVolumesFlow),
    takeEvery(workDetailsActions.createWork.types.BASE, createWorkFlow),
    takeEvery(workDetailsActions.editWork.types.BASE, editWorkFlow),
    takeEvery(workDetailsActions.addAggregation.types.BASE, addAggregationFlow),
    takeEvery(workDetailsActions.updateAggregation.types.BASE, updateAggregationFlow),
    takeEvery(workDetailsActions.removeAggregation.types.BASE, removeAggregationFlow),
    takeEvery(workDetailsActions.setWorkCosts.types.BASE, setWorkCostsFlow),
    takeEvery(workDetailsActions.addWorkResourcesByNorm.types.BASE, addWorkResourcesByNormFlow),
    takeEvery(workDetailsActions.loadSpecWithWorkload.types.BASE, loadSpecWithWorkloadFlow),
    takeEvery(workDetailsActions.addWorkResourcesBySpecification.types.BASE, addWorkResourcesBySpecificationFlow),
  ]);
}
