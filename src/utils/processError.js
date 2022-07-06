import { all, put } from 'redux-saga/effects';
import { externalActions } from '../redux/slices';

export const processError = (error, ...func) => {
  if ((error.response || {}).status !== 403) {
    func.push(
      put(
        externalActions.showNotification.base({
          message: (error.context || {}).message || (error.response || {}).data || String(error),
          variant: 'error',
        })
      )
    );
  }
  return all(func);
};
