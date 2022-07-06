import request, { getBase } from '@demo/request';

const API = getBase('project-service');

export const searchModels = ({ projectId, modelsIds }) =>
  request
    .post(API(`/projects/${projectId}/models/search`), {
      ids: modelsIds,
      onlyModels: true,
    })
    .then(resp => resp.data);
