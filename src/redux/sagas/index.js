import { all, fork } from 'redux-saga/effects';

import worksList from './worksList';
import addWorkByRule from './addWorkByRule';
import resourcesList from './resourcesList';
import workDetails from './workDetails';
import orgRules from './orgRules';
import costsAllTable from './costsAllTable';
import addResBySpecification from './addResBySpecification';
import wrapper from './wrapper';

export default function* root() {
  yield all([
    fork(worksList),
    fork(addWorkByRule),
    fork(resourcesList),
    fork(workDetails),
    fork(orgRules),
    fork(costsAllTable),
    fork(addResBySpecification),
    fork(wrapper),
  ]);
}
