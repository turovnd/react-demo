import { createSlice } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';
import { groupBy, findLastIndex } from 'lodash';

const initialState = {
  rows: [],
  total: 0,
  isLoading: false,
  isAdding: false,
  selectedWorks: [],
};

const { actions, selectors, reducer } = createSlice({
  prefix: worksUi.id,
  name: 'addWorkByRule',
  initialState,

  selectors: {
    selectRows: state => state.rows,
    selectTotal: state => state.total,
    selectIsLoading: state => state.isLoading,
    selectIsAdding: state => state.isAdding,
    selectSelectedWorks: state => state.selectedWorks.map(w => w.workId),
    selectSelectedWorksFull: state => state.selectedWorks,
  },

  reducers: {
    devitalize: { base: () => initialState },

    submitWorks: {
      base: state => {
        state.isAdding = true;
      },
      failed: state => {
        state.isAdding = false;
      },
      success: state => {
        state.isAdding = false;
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

    checkWorks: {
      base: (state, action) => {
        const { works } = action.payload;
        // Split selected (is store) works to 2 parts: included in store works and not.
        // If work included in store, remove it from store selectedWorks, else add it to store.
        const { true: toRemove = [], false: toAdd = [] } = groupBy(works, work =>
          Boolean(state.selectedWorks.find(w => w.workId === work.workId))
        );

        // Initially set added works.
        const newSelectedWorks = toAdd;

        // Skip all removed works.
        state.selectedWorks.forEach(work => {
          if (!toRemove.find(w => w.workId === work.workId)) {
            newSelectedWorks.push(work);
          }
        });

        // Set new works.
        state.selectedWorks = newSelectedWorks;
      },
    },

    toggleRow: {
      base: (state, action) => {
        const { rowId } = action.payload;

        const targetRowIndex = state.rows.findIndex(row => row._id === rowId);

        if (targetRowIndex !== -1) {
          const firstChildrenIndex = targetRowIndex + 1;
          const isExpanded = (state.rows[firstChildrenIndex] || {}).parentId === rowId;

          // Collapse row logic.
          if (isExpanded) {
            // Find index of last children of expanded row.
            const lastChildrenIndex = findLastIndex(state.rows, row => row.parentId === rowId);

            if (lastChildrenIndex !== -1) {
              // Collapse row.
              const deleteCount = lastChildrenIndex - firstChildrenIndex + 1;
              state.rows.splice(firstChildrenIndex, deleteCount);
              state.total -= deleteCount;
            }
          }

          // Expand row logic.
          if (!isExpanded) {
            const rowsToInject = (state.rows[targetRowIndex] || {}).works.map(work => ({
              ...work,
              parentId: rowId,
            }));

            state.rows.splice(firstChildrenIndex, 0, ...rowsToInject);
            state.total += rowsToInject.length;
          }
        }
      },
    },
  },
});

export { reducer as addWorkByRule, actions as addWorkByRuleActions, selectors as addWorkByRuleSelectors };
