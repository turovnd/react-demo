import request, { getBase } from '@demo/request';

const API = getBase('costs-service');

export const attachPositionsToWork = ({ projectId, workId, positionsIds }) =>
  request
    .put(API(`/costs/positions/link-by-work/${workId}`), {
      projectId,
      costPositionIds: positionsIds,
    })
    .then(resp => resp.data);

export const searchCosts = ({ projectId, filters, offset, limit }) =>
  request
    .post(API('/costs/search'), {
      projectId,
      filters,
      offset,
      limit,
    })
    .then(resp => resp.data);

export const getCostSections = ({ projectId, costId }) =>
  request
    .get(API(`/costs/${costId}/sections`), {
      params: { projectId },
    })
    .then(resp => resp.data);

export const getCostPositionsResources = ({ costPositionIds, projectId }) =>
  request
    .post(API('/costs/positions/resources'), {
      costPositionIds,
      projectId,
    })
    .then(resp => resp.data)
    .catch(() => []);

export const getLinkedWorkCosts = ({ projectId, workId }) =>
  request
    .get(API(`/costs/positions/by-work/${workId}`), {
      params: { projectId },
    })
    .then(resp => resp.data)
    .catch(() => []);

export const searchCostPositions = ({ projectId, costId, filters, offset, limit, onlyNorms }) =>
  request
    .post(API(`/costs/${costId}/positions/search`), {
      filters,
      offset,
      limit,
      onlyNorms,
      projectId,
    })
    .then(resp => resp.data);
