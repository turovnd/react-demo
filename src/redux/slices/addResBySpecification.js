import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

const initialState = {
  rows: [],
  total: 0,
  isLoading: false,
  isOpen: false,
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'addResBySpecification',
  initialState,

  selectors: {
    selectRows: state => state.rows,
    selectTotal: state => state.total,
    selectIsLoading: state => state.isLoading,
    selectIsOpen: state => state.isOpen,
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

        if (offset === 0) {
          state.rows = rows;
        } else {
          for (let i = 0; i < rows.length; i += 1) {
            state.rows[i + offset] = rows[i];
          }
        }

        state.isLoading = false;
        state.total = total;
      },
    },

    setIsOpen: {
      base: (state, action) => {
        state.isOpen = action.payload;
      },
    },
  },
});

export {
  reducer as addResBySpecification,
  actions as addResBySpecificationActions,
  selectors as addResBySpecificationSelectors,
};
