import React from 'react';
import { render } from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NotificationProvider } from '@demo/notifications';
import { ThemeProvider, CssBaseline, DefaultTheme } from '@demo/theming';
import { getRoute, worksUi } from '@demo/registry-ui/applications';
import { ROUTE_NAMES } from '@demo/registry-ui';
import { store } from '@demo/store';
import { PlatformUI } from '@demo/platform-ui';
import { LocalizationProvider } from '@demo/localization';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import { NavigationRenderer } from '@demo/navigation-ui';
import { HeaderRenderer } from '@demo/header-ui';
import { projectsSelectors } from '@demo/project-data-management';
import globalize from './globalize';
import { dev } from '../../src/localization';
import worksListView from '../../src/views/worksListView';
import workEditView from '../../src/views/workEditView';
import createWorkByRuleView from '../../src/views/createWorkByRuleView';
import workDetailsView from '../../src/views/workDetailsView';
import resourcesListView from '../../src/views/resourcesListView';
import createWorkView from '../../src/views/createWorkView';
import Wrapper from '../../src/views/worksWrapper';

globalize();

const makeRoute = name => getRoute(worksUi, name).path;

const DemoComponent = () => {
  const project = useSelector(projectsSelectors.selectProject);

  return (
    <div>
      <HeaderRenderer />
      <div style={{ inset: 0, top: 56, position: 'absolute', display: 'flex' }}>
        <NavigationRenderer projectId={project._id} section={project._id ? 'projects' : 'common'} />{' '}
        <PlatformUI>
          <Switch>
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS)} component={worksListView} />
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS_NEW_BY_RULE)} component={createWorkByRuleView} />
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS_WORK_ADD)} component={createWorkView} />
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS_WORK_DETAILS)} component={workDetailsView} />
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS_WORK_EDIT)} component={workEditView} />
            <Route exact path={makeRoute(ROUTE_NAMES.WORKS_RESOURCES)} component={resourcesListView} />
          </Switch>
        </PlatformUI>
      </div>
    </div>
  );
};

const Demo = () => (
  <Router>
    <ThemeProvider theme={DefaultTheme}>
      <CssBaseline />
      <Provider store={store}>
        <LocalizationProvider
          messages={dev}
          modules={['platform-ui', 'search', 'elements-selection', 'viewer-tools', 'header-ui']}
        >
          <NotificationProvider>
            <DndProvider backend={HTML5Backend}>
              <Switch>
                <Route path={makeRoute(ROUTE_NAMES.WORKS_WRAPPER).replace('*', '')} component={Wrapper} />
              </Switch>

              <DemoComponent />
            </DndProvider>
          </NotificationProvider>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  </Router>
);

render(<Demo />, document.querySelector('#demo'));
