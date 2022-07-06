import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

const initialState = {
  rows: [],
  total: 0,
  isLoading: false,
  isBusy: true,
  projectId: '',
  filters: [],
  elements: [],
  offset: 0,
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'resourcesList',
  initialState,

  selectors: {
    selectRows: state => state.rows,
    selectTotal: state => state.total,
    selectIsLoading: state => state.isLoading,
    selectIsBusy: state => state.isBusy,
    selectProjectId: state => state.projectId,
    selectElements: state => state.filters,
    selectFilters: state => state.elements,
    selectOffset: state => state.offset,
  },

  reducers: {
    devitalize: { base: () => initialState },

    searchRows: {
      base: (state, action) => {
        const { reset } = action.payload;
        state.isLoading = true;
        state.isBusy = true;

        if (reset) {
          state.rows = [];
          state.total = 0;
        }
      },
      failed: state => {
        state.isLoading = false;
        state.isBusy = true;
      },
      success: (state, action) => {
        const { rows, total, offset, isBusy, projectId, elements, filters } = action.payload;

        for (let i = 0; i < rows.length; i += 1) {
          state.rows[i + offset] = { ...rows[i], _id: rows[i].resId };
        }
        state.isLoading = false;
        state.isBusy = Boolean(isBusy);
        state.total = total;
        state.projectId = projectId;
        state.elements = elements;
        state.filters = filters;
        state.offset = offset;
      },
    },
  },
});

export { reducer as resourcesList, actions as resourcesListActions, selectors as resourcesListSelectors };
