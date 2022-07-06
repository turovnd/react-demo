import { createSlice, createSelector } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';
import { groupBy, partition } from 'lodash';

import { I18N_UNITS, RES_TYPES, PROJECT_SECTIONS } from '../../definitions';
import {
  transformAggregations,
  transformResourcesAddedByCatalog,
  transformResourcesAddedBySpecification,
} from '../../utils/transformers';

const initialState = {
  initialAggregations: [],
  aggregations: [],

  isCostPositionsChanged: false,
  isAggregationAdding: false,
  updatingAggregationIndex: -1,
  beforeUpdateAggregationStateSnapshot: null,

  costs: [],

  details: {
    code: '',
    name: '',
    unitKey: I18N_UNITS[0].value,
    unitCoeff: 1,
    section: PROJECT_SECTIONS[2],
    type: '',
  },

  isAddByNormsOpen: false,
  isCreatingWorkByNorm: false,
  isAddByCatalogOpen: false,
  initialAddByCatalogResType: null,

  resources: [],
  // Array with removed res ids. Used to update resources on save/edit work.
  removedResourcesIds: [],
  resourcesSnapshot: [],

  volumes: [],
  volumesIsLoading: false,

  isEditing: false,
  isLoading: false,
  isSubmitting: false,
  shouldPingWorkProcessing: false,
};

const updateResources = (state, resources, source) => {
  let sourceUniqResKey = 'resId';
  if (source === 'specification') {
    sourceUniqResKey = '_id';
  }

  resources.forEach(newRes => {
    const existedIndex = state.resources.findIndex(r => r[sourceUniqResKey] === newRes[sourceUniqResKey]);

    if (existedIndex > -1) {
      state.resources[existedIndex] = { ...state.resources[existedIndex], ...newRes };
    } else {
      state.resources.push(newRes);
    }
  });
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'workDetails',
  initialState,

  selectors: {
    selectInitialAggregations: state => state.initialAggregations,
    selectAggregations: state => state.aggregations,
    selectIsCostPositionsChanged: state => state.isCostPositionsChanged,
    selectUpdatingAggregationIndex: state => state.updatingAggregationIndex,
    selectIsAggregationAdding: state => state.isAggregationAdding,

    selectDetails: state => state.details,
    selectCosts: state => state.costs,
    selectIsLoading: state => state.isLoading,
    selectIsSubmitting: state => state.isSubmitting,
    selectIsEditing: state => state.isEditing,
    selectIsAddByNormsOpen: state => state.isAddByNormsOpen,
    selectIsCreatingWorkByNorm: state => state.isCreatingWorkByNorm,
    selectIsAddByCatalogOpen: state => state.isAddByCatalogOpen,
    selectInitialAddByCatalogResType: state => state.initialAddByCatalogResType,
    selectVolumes: state => state.volumes,
    selectVolumesIsLoading: state => state.volumesIsLoading,
    selectResources: state => state.resources,
    selectRemovedResourcesIds: state => state.removedResourcesIds,
    selectShouldPingWorkProcessing: state => state.shouldPingWorkProcessing,

    selectCatalogSourceResources: createSelector(
      state => state.resources,
      resources => resources.filter(res => res.source === 'catalog')
    ),
    selectSpecificationSourceResources: createSelector(
      state => state.resources,
      resources => resources.filter(res => res.source === 'specification')
    ),
    selectResourcesByType: createSelector(
      state => state.resources,
      resources => groupBy(resources, 'resType')
    ),
    selectResourcesByBase: createSelector(
      state => state.resources,
      resources => {
        const [projectRes, withoutProjectRes] = partition(resources, res => res.resType === RES_TYPES.project);

        const groupBySource = groupBy(
          withoutProjectRes,
          res => `${(res.details || {}).sourceCode || ''} ${(res.details || {}).sourceName}`
        );

        /**
         * Split to 3 groups:
         * - resources by norm names
         * - resources without norm names
         * - resources with resType === project
         */
        return { ...groupBySource, _project: projectRes };
      }
    ),
  },

  reducers: {
    devitalize: { base: () => initialState },

    getWorkDetails: {
      base: state => {
        state.isLoading = true;
        state.details = { ...initialState.details };
        state.initialAggregations = [];
      },
      failed: state => {
        state.isLoading = false;
      },
      success: (state, action) => {
        const { details, costs, aggregations, resources } = action.payload;
        state.details = { ...state.details, ...details };
        state.costs = costs;
        state.isLoading = false;
        state.aggregations = aggregations;
        state.initialAggregations = aggregations;
        state.resources = resources;
        state.resourcesSnapshot = resources;
      },
    },

    setWorkParams: {
      base: (state, action) => {
        const { name, code, section, type, unitKey, unitCoeff } = action.payload;

        // Set name only on create work by cost.
        if (name) state.details.name = name;
        if (code) state.details.code = code;
        if (type) state.details.type = type;
        if (section) state.details.section = section;
        if (unitKey) state.details.unitKey = unitKey;
        if (unitCoeff) state.details.unitCoeff = unitCoeff;
      },
    },

    setIsEditing: {
      base: (state, action) => {
        const { editing } = action.payload;
        state.isEditing = editing;

        if (!editing) {
          state.resources = state.resourcesSnapshot;
          state.aggregations = state.initialAggregations;
        }
      },
    },

    updateAggregation: {
      base: (state, action) => {
        const { aggregation, index } = action.payload;
        state.updatingAggregationIndex = index;

        if (index > -1) {
          const transformed = transformAggregations([aggregation])[0];
          // Just update in store, then do nothing on SUCCESS work submit,
          // or restore current state on ERROR action.
          state.beforeUpdateAggregationStateSnapshot = state.aggregations;
          state.aggregations[index] = transformed;
        }
      },
      failed: state => {
        if (state.updatingAggregationIndex > -1) {
          // Restore state before update on ERROR action.
          state.aggregations[state.updatingAggregationIndex] = state.beforeUpdateAggregationStateSnapshot;
          state.beforeUpdateAggregationStateSnapshot = null;
        }
      },
      success: state => {
        // Clear saved state on update.
        state.beforeUpdateAggregationStateSnapshot = null;
        state.updatingAggregationIndex = -1;
      },
    },

    refreshInitialAggregations: {
      base: state => {
        state.initialAggregations = state.aggregations;
      },
    },

    setAggregations: {
      base: (state, action) => {
        state.aggregations = action.payload;
      },
    },

    addAggregation: {
      base: state => {
        state.isAggregationAdding = true;
      },
      failed: state => {
        state.isAggregationAdding = false;
      },
      success: (state, action) => {
        const { aggregation } = action.payload;
        state.isAggregationAdding = false;
        state.aggregations.push(aggregation);
      },
    },

    syncVolumes: {
      base: state => {
        state.volumesIsLoading = true;
      },
      failed: state => {
        state.volumesIsLoading = false;
      },
      success: (state, action) => {
        const { volumes } = action.payload;
        state.volumesIsLoading = false;
        state.volumes = volumes;
      },
    },

    removeAggregation: {
      base: (state, action) => {
        const { aggregationId } = action.payload;
        const targetIndex = state.aggregations.findIndex(a => a._id === aggregationId);

        if (targetIndex > -1) {
          state.aggregations.splice(targetIndex, 1);
        }
      },
    },

    setWorkCosts: {
      base: (state, action) => {
        const { costs } = action.payload;
        state.costs = costs;
      },
      success: (state, action) => {
        const { resources } = action.payload;
        state.resources = [...state.resources, ...resources];
        state.isCostPositionsChanged = true;
      },
    },

    removeWorkCost: {
      base: (state, action) => {
        const { costId } = action.payload;
        const targetIndex = state.costs.findIndex(cost => cost._id === costId);

        if (targetIndex > -1) {
          state.costs.splice(targetIndex, 1);
        }
        state.isCostPositionsChanged = true;
      },
    },

    createWork: {
      base: state => {
        state.isSubmitting = true;
      },
      failed: state => {
        state.isSubmitting = false;
      },
      success: state => {
        state.isSubmitting = false;
      },
    },

    editWork: {
      base: state => {
        state.isSubmitting = true;
      },
      failed: state => {
        state.isSubmitting = false;
      },
      success: state => {
        state.isSubmitting = false;
        state.isEditing = false;
      },
    },

    setIsAddByNormOpen: {
      base: (state, action) => {
        const { isOpen, isCreatingWorkByNorm } = action.payload;

        state.isAddByNormsOpen = isOpen;

        if (isCreatingWorkByNorm && isOpen) {
          state.isCreatingWorkByNorm = isCreatingWorkByNorm;
        } else {
          state.isCreatingWorkByNorm = false;
        }
      },
    },

    setIsAddByCatalogOpen: {
      base: (state, action) => {
        const { isOpen, initialResType } = action.payload;
        state.isAddByCatalogOpen = isOpen;
        state.initialAddByCatalogResType = initialResType;
      },
    },

    addWorkResourcesByNorm: {
      success: (state, action) => {
        const { resources } = action.payload;
        state.resources.push(...resources);
      },
    },

    updateResConsumption: {
      base: (state, action) => {
        const { customId, consumption } = action.payload;

        const targetIndex = state.resources.findIndex(res => res.customId === customId);

        if (targetIndex > -1) {
          // Update consumption value of resource.
          state.resources[targetIndex].consumption = consumption;
        }
      },
    },

    removeResource: {
      base: (state, action) => {
        const { customId } = action.payload;

        const targetIndex = state.resources.findIndex(res => res.customId === customId);
        if (targetIndex > -1) {
          const targetRes = state.resources[targetIndex] || {};

          state.removedResourcesIds.push(targetRes._id);
          state.resources.splice(targetIndex, 1);
        }
      },
    },

    addWorkResourcesByCatalog: {
      base: (state, action) => {
        // There is all resources with source === `catalog`.
        const { resources } = action.payload;
        updateResources(state, transformResourcesAddedByCatalog(resources));
      },
    },

    addWorkResourcesBySpecification: {
      success: (state, action) => {
        const { resources, resCodesMap } = action.payload;
        const resIds = state.resources.map(i => i._id);
        updateResources(
          state,
          transformResourcesAddedBySpecification(
            resources.filter(res => !resIds.includes(res._id)),
            resCodesMap
          ),
          'specification'
        );
      },
    },

    loadSpecWithWorkload: {
      success: (state, { payload }) => {
        updateResources(state, [payload], 'specification');
        state.resourcesSnapshot = state.resources;
      },
    },
  },
});

export { reducer as workDetails, actions as workDetailsActions, selectors as workDetailsSelectors };
