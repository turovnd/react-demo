import request, { getBase } from '@demo/request';

const API = getBase('pricelist-service');

export const getResCodes = ({ resIds }) =>
  request
    .post(API(`/identity/getByResIds`), {
      resIds,
    })
    .then(resp => resp.data);
