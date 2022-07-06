import { store, sagaMiddleware, injectReducer, combineReducers } from '@demo/store';
import { worksUi } from '@demo/registry-ui/applications';

import {
  worksList,
  addWorkByRule,
  workDetails,
  resourcesList,
  orgRules,
  costsCommon,
  costsAllTable,
  addResBySpecification,
  wrapper,
} from './slices';
import sagas from './sagas';

injectReducer(
  worksUi.id,
  combineReducers({
    wrapper,
    worksList,
    addWorkByRule,
    workDetails,
    resourcesList,
    orgRules,
    costsCommon,
    costsAllTable,
    addResBySpecification,
  })
);

sagaMiddleware.run(sagas);

export default store;
