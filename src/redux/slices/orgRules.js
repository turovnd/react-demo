import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

const initialState = {
  rows: [],
  total: 0,
  isLoading: false,
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'orgRules',
  initialState,

  selectors: {
    selectRows: state => state.rows,
    selectIsLoading: state => state.isLoading,
    selectTotal: state => state.total,
  },

  reducers: {
    devitalize: { base: () => initialState },

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
  },
});

export { reducer as orgRules, actions as orgRulesActions, selectors as orgRulesSelectors };
