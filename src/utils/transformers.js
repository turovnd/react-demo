import { groupBy, uniqueId } from 'lodash';
import { LINKED_COSTS_TABLE_ROW_TYPES } from '../definitions';

/**
 * Fill positions array with cost names and sections.
 * Result looks like array with order of cost -> all cost sections -> section positions.
 */
export const transformSelectedPositionsToLinkedTableRows = (positions, emptySectionName) => {
  const groupedByCost = groupBy(positions, pos => ((pos || {}).costDetails || {})._id);

  return Object.entries(groupedByCost).reduce((costGroups, [costId, costPositions]) => {
    const groupedBySection = groupBy(costPositions, pos => pos.section);

    // Inject section row to each section grouped positions.
    const costSections = Object.entries(groupedBySection).reduce(
      (secGroups, [sectionName, sectionPositions]) => [
        ...secGroups,
        {
          _id: uniqueId('linked_table_section'),
          displayType: LINKED_COSTS_TABLE_ROW_TYPES.SECTION,
          section: sectionName === '' ? emptySectionName : sectionName,
          // Calculate total as all children `totalPrice` sum.
          total: sectionPositions.reduce((a, b) => a + b.totalPrice, 0),
        },
        ...sectionPositions.map(pos => ({
          ...pos,
          displayType: LINKED_COSTS_TABLE_ROW_TYPES.POSITION,
        })),
      ],
      []
    );

    // Inject cost row to each cost grouped positions.
    return [
      ...costGroups,
      {
        // Fill cost data (should find it because grouped only by `_id`).
        ...(positions.find(p => (p.costDetails || {})._id === costId) || {}).costDetails,
        displayType: LINKED_COSTS_TABLE_ROW_TYPES.COST,
      },
      // Inject grouped by sections rows.
      ...costSections,
    ];
  }, []);
};

/**
 * Get resources rows from norms.
 */
export const transformNormsResources = norms =>
  norms.reduce(
    (acc, norm) => [
      ...acc,
      ...(norm.resources || []).map(res => ({
        ...res,
        // Use own id, to search uniq row - resources from different norms can repeat and has same `_id`s.
        customId: uniqueId('resourceRow'),
        source: 'norm',
        unit: res.unitText,
        price: typeof res.price === 'number' ? res.price : (res.price || {}).value,
        details: {
          sourceName: norm.name,
          sourceCode: norm.code,
          sourceRootId: norm.catalogId,
          sourceRootCode: norm.catalogCode,
          normId: norm._id,
        },
      })),
    ],
    []
  );

/**
 * Fill resources rows from costs with ui data.
 */
export const transformCostsResources = resources =>
  resources.map(resource => ({
    ...resource,
    _id: resource.resId,
    source: 'costPosition',
    details: {
      positionId: resource.positionId,
      sourceName: resource.positionName,
      sourceCode: resource.positionCode,
    },
    // Use own id, to search uniq row - resources from different norms can repeat and has same `_id`s.
    customId: uniqueId('resourceRow'),
  }));

/**
 * Fill resources rows with custom ids, to have consistent way to work with resources.
 */
export const transformWorkResources = resources =>
  resources.map(res => ({
    ...res,
    resType: res.source === 'specification' ? 'project' : res.resType,
    // Use own id, to search uniq row - resources from different norms can repeat and has same `_id`s.
    customId: uniqueId('resourceRow'),
  }));

export const transformResourcesAddedByCatalog = resources =>
  resources.map(res => ({
    ...res,
    resId: res._id,
    source: 'catalog',
    unit: (res.unit || {}).text || res.unit,
    price: (res.lastPrice || {}).price || res.price,
    consumption: 1,
    // Use own id, to search uniq row - resources from different norms can repeat and has same `_id`s.
    customId: uniqueId('resourceRow'),
  }));

export const transformResourcesAddedBySpecification = (resources, resCodesMap) =>
  resources.map(res => ({
    ...res,
    resId: (res.details || {}).resId || res.resId,
    code:
      (resCodesMap[(res.details || {}).resId || res.resId] || {}).manufacturer ||
      (resCodesMap[(res.details || {}).resId || res.resId] || {}).supplier ||
      (resCodesMap[(res.details || {}).resId || res.resId] || {}).dealer ||
      '-',
    resType: 'project',
    unit: (res.unit || {}).text,
    price: res.resPrice,
    consumption: res.quantityModelCoeff,
    details: {
      specificationId: (res.details || {}).specificationId || res._id,
      attribute: res.quantityModelAttribute,
    },
    // Use own id, to search uniq row - resources from different norms can repeat and has same `_id`s.
    customId: uniqueId('resourceRow'),
    source: 'specification',
  }));

export const transformAggregations = aggregations => aggregations.map(agr => ({ _id: agr._id, ...agr.selection }));

export const transformRules = rules =>
  rules.map(rule => {
    const works = (rule.predicts || []).reduce(
      (arr, predict) => [
        ...arr,
        ...(predict.artefacts || [])
          .filter(a => a.type === 'work')
          .reduce(
            (arr2, item) => [
              ...arr2,
              ...item.list.map(work => ({
                ...work,
                _id: work.id,
                projectId: predict.projectId,
              })),
            ],
            []
          ),
      ],
      []
    );

    return {
      ...rule,
      works,
    };
  });

export const transformResourcesForWorkSubmit = resources => {
  const mapComplex = rows =>
    Object.entries(rows).reduce((acc, [entryId, entryResources]) => {
      entryResources.forEach(resource => {
        if (acc[entryId]) {
          acc[entryId][resource.resId || resource._id] = resource.consumption;
        } else {
          acc[entryId] = { [resource.resId || resource._id]: resource.consumption };
        }
      });

      return acc;
    }, {});

  const {
    norm: byNorm = [],
    catalog: byCatalog = [],
    specification: bySpec = [],
    costPosition: byCostPos = [],
  } = groupBy(resources, 'source');

  const transformedByCatalog = byCatalog.reduce(
    (acc, res) => ({ ...acc, [res.resId || res._id]: res.consumption }),
    {}
  );

  const transformedBySpecification = bySpec.reduce(
    (acc, res) => ({ ...acc, [(res.details || {}).specificationId || res._id]: 1 }),
    {}
  );

  const normResByNormId = groupBy(byNorm, res => res.details.normId);
  const transformedNormRes = mapComplex(normResByNormId);

  const costPosResByPosId = groupBy(byCostPos, res => res.details.costPositionId || res.details.positionId);
  const transformedCostPositions = mapComplex(costPosResByPosId);

  return {
    norm: transformedNormRes,
    catalog: transformedByCatalog,
    specification: transformedBySpecification,
    costPosition: transformedCostPositions,
  };
};
