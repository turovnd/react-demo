import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';
import { positionsSelectorCreator, transformCostRows } from '../../utils/costsTransformers';
import { costsCommonSelectors } from './costsCommon';

const initialState = {
  costs: {
    rows: [],
    total: 0,
    isLoading: false,
  },
  sections: [],
  collapsedSections: [],
  positions: {
    rows: [],
    total: 0,
    isLoading: false,
  },
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'costsAllTable',
  initialState,

  selectors: {
    // Costs table.
    selectRows: state => state.costs.rows,
    selectTotal: state => state.costs.total,
    selectIsLoading: state => state.costs.isLoading,

    // Positions table.
    selectSections: state => state.sections,
    selectCollapsedSections: state => state.collapsedSections,
    selectPositionsIsLoading: state => state.positions.isLoading,
    selectPatchedPositions: positionsSelectorCreator(
      (_, fullState) => costsCommonSelectors.selectFilters(fullState),
      state => state.positions.rows,
      state => state.positions.total,
      state => state.sections,
      state => state.collapsedSections,
      transformCostRows
    ),
  },

  reducers: {
    devitalize: { base: () => initialState },
    searchRows: {
      base: (state, action) => {
        const { reset } = action.payload;
        state.costs.isLoading = true;

        if (reset) {
          state.costs.rows = [];
          state.costs.total = 0;
        }
      },
      failed: state => {
        state.costs.isLoading = false;
      },
      success: (state, action) => {
        const { rows, total, offset } = action.payload;

        for (let i = 0; i < rows.length; i += 1) {
          state.costs.rows[i + offset] = rows[i];
        }

        state.costs.isLoading = false;
        state.costs.total = total;
      },
    },
    searchSections: {
      base: state => {
        state.sections = [];
      },
      success: (state, action) => {
        const { rows } = action.payload;

        state.sections = rows;
      },
    },
    searchPositionsRows: {
      base: (state, action) => {
        const { reset } = action.payload;
        state.positions.isLoading = true;

        if (reset) {
          state.positions.rows = [];
          state.positions.total = 0;
        }
      },
      failed: state => {
        state.positions.isLoading = false;
      },
      success: (state, action) => {
        const { rows, total, offset } = action.payload;

        for (let i = 0; i < rows.length; i += 1) {
          const storeIndex = offset + i;
          state.positions.rows[storeIndex] = {
            ...rows[i],

            // Save store index to row to know from which index load more rows later.

            // This is safe solution as cost position rows cannot be added or removed to cost
            // as it permanently has uniq index in store.
            __index: storeIndex,
          };
        }

        state.positions.isLoading = false;
        state.positions.total = total;
      },
    },
    toggleSectionCollapse: {
      base: (state, action) => {
        const { section } = action.payload;

        const targetIdx = state.collapsedSections.findIndex(sec => sec === section);

        if (targetIdx !== -1) {
          state.collapsedSections.splice(targetIdx, 1);
        } else {
          state.collapsedSections.push(section);
        }
      },
    },
  },
});

export { reducer as costsAllTable, actions as costsAllTableActions, selectors as costsAllTableSelectors };
