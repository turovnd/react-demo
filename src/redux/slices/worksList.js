import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

const initialState = {
  rows: [],
  total: 0,
  isLoading: false,
  isRemoving: false,
  filters: [],
  volumes: {},
  worksModelsMap: {},
  volumesLoading: {},
  isRuleSubmitting: false,
};

const getVolumesMap = data =>
  Object.keys(data).reduce((acc, workId) => {
    (data[workId] || []).forEach(next => {
      acc[workId] = {
        volume: ((acc[workId] || {}).volume || 0) + (next || {}).volume || 0,
        area: ((acc[workId] || {}).area || 0) + (next || {}).area || 0,
        length: ((acc[workId] || {}).length || 0) + (next || {}).length || 0,
        weight: ((acc[workId] || {}).weight || 0) + (next || {}).weight || 0,
        quantity: ((acc[workId] || {}).quantity || 0) + (next || {}).quantity || 0,
        attributes: {
          ...((acc[workId] || {}).attributes || {}),
          ...Object.keys((next || {}).attributes || {}).reduce(
            (map2, key) => ({
              ...map2,
              [key]:
                (((acc[workId] || {}).attributes || {})[key] || 0) +
                (map2[key] || 0) +
                (((next || {}).attributes || {})[key] || 0),
            }),
            {}
          ),
        },
      };
      ((next || {}).resourceVolumes || []).forEach(next2 => {
        acc[workId + next2.specification] = {
          volume: ((acc[workId + next2.specification] || {}).volume || 0) + (next2 || {}).volume || 0,
          area: ((acc[workId + next2.specification] || {}).area || 0) + (next2 || {}).area || 0,
          length: ((acc[workId + next2.specification] || {}).length || 0) + (next2 || {}).length || 0,
          weight: ((acc[workId + next2.specification] || {}).weight || 0) + (next2 || {}).weight || 0,
          quantity: ((acc[workId + next2.specification] || {}).quantity || 0) + (next2 || {}).quantity || 0,
          attributes: {
            ...((acc[workId + next2.specification] || {}).attributes || {}),
            ...Object.keys((next2 || {}).attributes || {}).reduce(
              (map2, key) => ({
                ...map2,
                [key]:
                  (((acc[workId + next2.specification] || {}).attributes || {})[key] || 0) +
                  (map2[key] || 0) +
                  (((next2 || {}).attributes || {})[key] || 0),
              }),
              {}
            ),
          },
        };
      });
    });
    return acc;
  }, {});

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'worksList',
  initialState,

  selectors: {
    selectRows: state => state.rows,
    selectTotal: state => state.total,
    selectIsLoading: state => state.isLoading,
    selectIsRemoving: state => state.isRemoving,
    selectVolume: state => state.volumes,
    selectVolumeLoading: state => state.volumesLoading,
    selectFilters: state => state.filters,
    selectWorksModelsMap: state => state.worksModelsMap,
    selectIsRuleSubmitting: state => state.isRuleSubmitting,
  },

  reducers: {
    devitalize: { base: () => initialState },

    submitRule: {
      base: state => {
        state.isRuleSubmitting = true;
      },
      failed: state => {
        state.isRuleSubmitting = false;
      },
      success: state => {
        state.isRuleSubmitting = false;
      },
    },

    removeWork: {
      base: state => {
        state.isRemoving = true;
      },
      failed: state => {
        state.isRemoving = false;
      },
      success: (state, action) => {
        const { workId } = action.payload;
        const targetIndex = state.rows.findIndex(work => work._id === workId);

        if (targetIndex > -1) {
          state.rows.splice(targetIndex, 1);
          state.total -= 1;
        }

        state.isRemoving = false;
      },
    },

    searchRows: {
      base: (state, action) => {
        const { reset } = action.payload;
        state.isLoading = true;

        if (reset) {
          state.rows = [];
          state.total = 0;
        }
      },
      failed: state => {
        state.isLoading = false;
      },
      success: (state, action) => {
        const { rows, total, offset } = action.payload;

        for (let i = 0; i < rows.length; i += 1) {
          state.rows[i + offset] = rows[i];
        }

        state.isLoading = false;
        state.total = total;
      },
    },

    loadVolumes: {
      base: (state, { payload: { worksMap, reset } }) => {
        state.worksModelsMap = {
          ...(reset ? {} : state.worksModelsMap),
        };
        state.volumesLoading = {
          ...(reset ? {} : state.volumesLoading),
          ...Object.keys(worksMap).reduce((m, i) => ({ ...m, [i]: true }), {}),
        };
      },
      success: (state, { payload: { worksMap, data } }) => {
        const transformedData = getVolumesMap(data);
        Object.keys(worksMap).forEach(workId => {
          delete state.volumesLoading[workId];
          (worksMap[workId] || []).forEach(specId => {
            state.volumes[workId + specId] = transformedData[workId + specId] || {};
          });
          state.volumes[workId] = transformedData[workId] || {};
        });

        state.worksModelsMap = {
          ...state.worksModelsMap,
          ...Object.entries(data).reduce(
            (acc, [workId, modelEntries]) => ({ ...acc, [workId]: modelEntries.map(m => m.modelVersionId) }),
            {}
          ),
        };
      },
      failed: (state, { payload: { worksMap } }) => {
        state.worksModelsMap = {};
        Object.keys(worksMap).forEach(id => {
          delete state.volumesLoading[id];
          delete state.volumes[id];
        });
      },
    },

    setFilters: {
      base: (state, { payload }) => {
        state.filters = payload;
      },
    },
  },
});

export { reducer as worksList, actions as worksListActions, selectors as worksListSelectors };
