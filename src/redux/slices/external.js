import { showNotification, closeNotification } from '@demo/notifications';
import { modelsSelectors, modelsActions, projectsSelectors, projectsActions } from '@demo/project-data-management';

const { selectModels, selectIsModelsReady, selectModelData } = modelsSelectors;
const { selectProject, selectIsProjectLoading, selectIsProjectSync } = projectsSelectors;

export const externalSelectors = {
  selectModels,
  selectModelData,
  selectModelsData: modelsSelectors.selectModelsData,
  selectIsModelsReady,
  selectProject,
  selectIsProjectLoading,
  selectIsProjectSync,
};

export const externalActions = {
  showNotification,
  closeNotification,
  setProjectSync: projectsActions.setProjectSync,
  loadModels: modelsActions.loadModels,
};
