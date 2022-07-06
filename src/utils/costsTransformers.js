import { groupBy, isEqual, has } from 'lodash';
import { createSelectorCreator, defaultMemoize } from 'reselect';

const getSectionFiltersCount = (filter, allSections) => {
  const sections = filter.find(f => f.key === 'section');

  // If filter selected - add filters count.
  if (((sections || {}).value || {}).length) {
    return (sections && sections.value.length) || 0;
  }

  // If no filter selected (display all sections) - add all sections count.
  return allSections.length;
};

export const transformCostRows = (filters, positions, total, sections, collapsedSections) => {
  const groupedBySection = groupBy(positions, 'section');

  let collapsedRowsCount = 0;
  let patchedRows = [];

  Object.entries(groupedBySection).forEach(([section, sectionPositions]) => {
    const sectionPrice = sectionPositions.reduce((price, pos) => price + (pos.totalPrice || 0), 0);

    const sectionRow = {
      isSection: true,
      totalPrice: sectionPrice,
      name: section,
      childCount: sectionPositions.length,
    };

    if (collapsedSections.includes(section)) {
      collapsedRowsCount += sectionPositions.length;
      patchedRows.push(sectionRow);
    } else {
      patchedRows = patchedRows.concat([sectionRow, ...sectionPositions.map(pos => ({ ...pos, section }))]);
    }
  });

  let patchedTotal;

  if (total === 0) {
    patchedTotal = 0;
  }

  // Total is original total number with section rows count and without collapsed rows count.
  if (total !== 0) {
    patchedTotal = total + getSectionFiltersCount(filters, sections) - collapsedRowsCount;
  }

  return { total: patchedTotal, rows: patchedRows };
};

// Check if object is filter like.
const isObjectFitToFilterPattern = item => has(item, 'key') && has(item, 'value') && Array.isArray(item.value);

export const positionsSelectorCreator = createSelectorCreator(defaultMemoize, (a, b) => {
  // Ignore recompute values on filter change to optimize performance.
  // !!! Do not update on filters change to avoid UI crash. Update on filters is recalculate
  // total rows count and can cause loadMoreRows call without rows update.
  if (Array.isArray(a) || Array.isArray(b)) {
    if (a.some(isObjectFitToFilterPattern) || b.some(isObjectFitToFilterPattern)) {
      return true;
    }
  }

  // Return deep equal check.
  return isEqual(a, b);
});
