import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';
import { xorBy } from 'lodash';

import { COSTS_TABS } from '../../definitions';

const initialState = {
  isOpen: false,
  tab: COSTS_TABS.ALL,
  filters: [],

  // Flag for creating work - if true on costs close - set work name and other data.
  isCreatingWorkByCost: false,

  // Store selected cost positions in format { _id, ..., costData, ... }
  // to be able to sort by costs and sections and display in linked costs table.
  selectedPositions: [],

  // Save initial positions on open costs sections to
  // display all rows in linked table if uncheck some rows.
  openedWithSelectedPositions: [],

  cost: null,
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'costsCommon',
  initialState,

  selectors: {
    selectIsOpen: state => state.isOpen,
    selectTab: state => state.tab,
    // Make selector accessible from other selectors.
    selectFilters: (_, fullState) => fullState[worksUi.id].costsCommon.filters,
    selectSelectedPositions: state => state.selectedPositions,
    selectIsCreatingWorkByCost: state => state.isCreatingWorkByCost,
    selectOpenedWithSelectedPositions: state => state.openedWithSelectedPositions,

    // All table
    selectCost: state => state.cost,
  },

  reducers: {
    devitalize: { base: () => initialState },

    setIsOpen: {
      base: (state, action) => {
        const { isOpen, tab, costPositions, isCreatingWorkByCost } = action.payload;
        if (isCreatingWorkByCost) {
          state.isCreatingWorkByCost = isCreatingWorkByCost;
        }

        state.isOpen = isOpen;
        state.tab = tab;
        state.selectedPositions = costPositions;

        if (isOpen === true) {
          state.openedWithSelectedPositions = costPositions;
        } else {
          state.openedWithSelectedPositions = [];
        }
      },
    },

    setTab: {
      base: (state, action) => {
        const { tab } = action.payload;
        state.tab = tab;

        // Clear filters on tab change.
        state.filters = [];

        // Clear table.
        state.cost = null;
      },
    },

    setFilters: {
      base: (state, action) => {
        const { filters } = action.payload;
        state.filters = filters;
      },
    },

    setCost: {
      base: (state, action) => {
        const { cost } = action.payload;
        state.cost = cost;
      },
    },

    toggleSelectedPositions: {
      base: (state, action) => {
        const { positions, sectionClear } = action.payload;

        if (sectionClear) {
          state.selectedPositions = state.selectedPositions.filter(position => position.section !== sectionClear);
        } else {
          state.selectedPositions = xorBy(positions, state.selectedPositions, '_id');
        }
      },
    },
  },
});

export { reducer as costsCommon, actions as costsCommonActions, selectors as costsCommonSelectors };
