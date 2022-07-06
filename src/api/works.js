import request, { getBase } from '@demo/request';

const API = getBase('works-service');

export const createWork = ({ projectId, work }) =>
  request.post(API(`/works`), { projectId, ...work }).then(resp => resp.data);

export const updateWork = ({ projectId, workId, work }) =>
  request.put(API(`/works/${workId}`), { projectId, ...work }).then(resp => resp.data);

/**
 * WorksList logic.
 */

export const searchWorks = ({ projectId, filters, elements, offset, limit }) =>
  request
    .post(
      API('/works/search'),
      {
        projectId,
        filters,
        elements,
        offset,
        limit,
      },
      { noCache: true }
    )
    .then(resp => resp.data);

export const removeWork = ({ projectId, workId }) =>
  request.delete(API(`/works/${workId}`), { params: { projectId } }).then(resp => resp.data);

export const getWorkById = ({ projectId, workId }) =>
  request
    .get(API(`/works/${workId}`), {
      params: { projectId },
    })
    .then(resp => resp.data);

/**
 * Resources list
 */

export const searchResources = ({ projectId, filters, elements, offset, limit }) =>
  request
    .post(API('/resources/search'), {
      projectId,
      filters,
      elements,
      offset,
      limit,
    })
    .then(resp => resp.data);

export const setResourcesToWork = ({ projectId, workId, resourcesMap }) =>
  request
    .put(API(`/works/${workId}/resources`), {
      projectId,
      resourcesMap,
    })
    .then(resp => resp.data);

export const editWorkResource = ({ projectId, workId, resId, consumption }) =>
  request
    .put(API(`/works/${workId}/resources/${resId}`), {
      projectId,
      consumption,
    })
    .then(resp => resp.data);

export const removeWorkResource = ({ projectId, workId, resId }) =>
  request
    .delete(API(`/works/${workId}/resources/${resId}`), {
      params: { projectId },
    })
    .then(resp => resp.data);

export const createByTemplate = ({ projectId, worksIds }) =>
  request.post(API('/works/by-template'), { projectId, works: worksIds }).then(resp => resp.data);
