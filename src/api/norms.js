import request, { getBase } from '@demo/request';

const API = getBase('norms-service');

export const getUnitData = ({ unitText, unitCoeff, unitLabel }) =>
  request.post(API('/units'), { unitText: unitText || `${unitCoeff} ${unitLabel}` }).then(resp => resp.data);

export const getNormsData = normsIds => request.post(API('/norms/by-ids'), { ids: normsIds }).then(resp => resp.data);
