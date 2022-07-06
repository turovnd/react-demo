import { getRoute, worksUi } from '@demo/registry-ui/applications';
import { ROUTE_NAMES } from '@demo/registry-ui';

export default {
  [getRoute(worksUi, ROUTE_NAMES.WORKS_WRAPPER).path]: 'worksWrapper',
  [getRoute(worksUi, ROUTE_NAMES.WORKS).path]: 'worksListView',
  [getRoute(worksUi, ROUTE_NAMES.WORKS_NEW_BY_RULE).path]: 'createWorkByRuleView',
  [getRoute(worksUi, ROUTE_NAMES.WORKS_WORK_ADD).path]: 'createWorkView',
  [getRoute(worksUi, ROUTE_NAMES.WORKS_WORK_DETAILS).path]: 'workDetailsView',
  [getRoute(worksUi, ROUTE_NAMES.WORKS_WORK_EDIT).path]: 'workEditView',
  [getRoute(worksUi, ROUTE_NAMES.WORKS_RESOURCES).path]: 'resourcesListView',
};
