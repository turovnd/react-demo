import { externalActions } from '../redux/slices';

export const suggestLoadModels = (msg, dispatch, projectId, modelIds) => {
  dispatch(
    externalActions.showNotification.base({
      message: msg('notification.suggestLoadModel'),
      options: { key: 'suggestLoadModel' },
      actions: [
        {
          variant: 'contained',
          children: msg('notification.loadModel'),
          onClick: () => {
            dispatch(externalActions.closeNotification.base({ key: 'suggestLoadModel' }));
            dispatch(
              externalActions.loadModels.base({
                projectId,
                ids: modelIds,
                shouldSetAsActive: true,
              })
            );
          },
        },
      ],
    })
  );
};
