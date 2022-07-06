import request, { getBase } from '@demo/request';

const API = getBase('elements-service');

export const searchWorkAggregations = ({ projectId, workId }) =>
  request.get(API(`/artefacts/${projectId}/assignments/work/${workId}`)).then(resp => resp.data);

export const searchSpecificationAggregations = ({ projectId, specificationId }) =>
  request.get(API(`/artefacts/${projectId}/assignments/specification/${specificationId}`)).then(resp => resp.data);

export const searchOrgRules = ({ filters, offset, limit, unassigned, projectId }) =>
  request
    .post(API('/elements/aggregations/by-organization'), {
      unassigned,
      projectId,
      filters,
      offset,
      limit,
      artefactType: 'work',
    })
    .then(resp => resp.data);

export const getVolumesForSpecifications = ({ specAgrIds, workAgrIds, projectId }) =>
  request
    .post(
      API(`/volumes/${projectId}/pivot`),
      {
        x: workAgrIds,
        y: specAgrIds,
      },
      { noCache: true }
    )
    .then(resp => resp.data);

export const createAggregation = (aggregation, projectId) =>
  request.post(API(`/elements/aggregations?projectId=${projectId}`), aggregation).then(resp => resp.data);

export const updateAggregation = (aggregationId, aggregation, projectId) =>
  request
    .put(API(`/elements/aggregations/${aggregationId}?projectId=${projectId}`), aggregation)
    .then(resp => resp.data);

export const updateAggregationsToWork = ({ projectId, assignedMap }) =>
  request.put(API(`/artefacts/${projectId}/assign/work`), assignedMap).then(resp => resp.data);

export const getVolumesByAggregations = ({ projectId, aggregationsIds }) =>
  request.post(API(`/volumes/${projectId}/by-aggregations`), aggregationsIds).then(resp => resp.data);

export const getVolumesByWorks = ({ projectId, works, revitIds, resourceVolumes }) =>
  request
    .post(API(`/volumes/${projectId}/works`), { works, revitIds, resourceVolumes }, { noCache: true })
    .then(resp => resp.data);

export const getElementsRevitIds = ({ projectId, workId, modelsIds }) =>
  request
    .post(API('/elements/search/by-artefact'), {
      projectId,
      models: modelsIds,
      artefactId: workId,
      artefactType: 'work',
    })
    .then(resp => resp.data);

export const getAggregationElements = ({ projectId, aggregationsIds, modelsIds }) =>
  request
    .post(API('/elements/search/by-aggregations'), {
      projectId,
      models: modelsIds,
      aggregations: aggregationsIds,
    })
    .then(resp => resp.data);

export const getFilterElements = ({ projectId, modelsIds, filters }) =>
  request
    .post(API('/elements/search/by-filters'), {
      projectId,
      models: modelsIds,
      filters,
    })
    .then(resp => resp.data);

export const getFiltersStats = (projectId, modelsIds) =>
  request
    .post(API(`/elements/${projectId}/get-stats`), {
      models: modelsIds,
      type: 'work',
    })
    .then(resp => resp.data);

export const getProjectState = projectId =>
  request.get(API('/elements/project-state'), { params: { projectId } }).then(resp => resp.data);
