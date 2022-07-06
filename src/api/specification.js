import request, { getBase } from '@demo/request';

const API = getBase('specification-service');

export const searchSpecifications = ({ projectId, elements, filters, offset, limit }) =>
  request
    .post(API(`/${projectId}/search`), {
      elements,
      filters,
      offset,
      limit,
    })
    .then(resp => resp.data);
