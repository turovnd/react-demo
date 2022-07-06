import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

const initialState = {
  stats: {
    hasWork: 0,
    hasNotWork: 0,
  },
  isStatsLoading: true,

  loadingFilterKey: '',
  selectedFilterKey: '',
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'wrapper',
  initialState,

  selectors: {
    selectStats: state => state.stats,
    selectIsStatsLoading: state => state.isStatsLoading,
    selectLoadingFilterKey: state => state.loadingFilterKey,
    selectSelectedFilterKey: state => state.selectedFilterKey,
  },

  reducers: {
    devitalize: { base: () => initialState },

    getStats: {
      base: state => {
        state.isStatsLoading = true;
      },
      failed: state => {
        state.isStatsLoading = false;
      },
      success: (state, action) => {
        const { hasWork, hasNotWork } = action.payload;
        state.isStatsLoading = false;
        state.stats.hasWork = hasWork;
        state.stats.hasNotWork = hasNotWork;
      },
    },

    disableFilter: {
      base: state => {
        state.selectedFilterKey = '';
      },
    },

    enableFilter: {
      base: (state, action) => {
        const { filter } = action.payload;
        state.loadingFilterKey = filter;
      },
      failed: state => {
        state.loadingFilterKey = '';
        state.selectedFilterKey = '';
      },
      success: (state, action) => {
        const { filter } = action.payload;
        state.selectedFilterKey = filter;
        state.loadingFilterKey = '';
      },
    },

    reloadCurrentFilter: {},
  },
});

export { reducer as wrapper, actions as wrapperActions, selectors as wrapperSelectors };
