import { viewerUtils } from '@demo/viewer-tools';
import { VIEWER_SELECTION_LISTENER_KEY } from '@demo/elements-selection';
import api from '../api';
import { makeInstantCall } from './makeInstantCall';

/**
 * The function to select viewer elements associated with work.
 */
export const isolateWorkElements = async (projectId, workId, modelsIds) => {
  const elementsToSelect = await makeInstantCall(api.elements.getElementsRevitIds, {
    projectId,
    workId,
    modelsIds,
  });

  viewerUtils.selectByMap(Object.fromEntries(modelsIds.map(mId => [mId, elementsToSelect[mId] || []])), {
    silent: true,
    silentExclude: [VIEWER_SELECTION_LISTENER_KEY],
    noSecondClick: true,
  });
};
