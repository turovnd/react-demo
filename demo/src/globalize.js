import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
import * as jss from 'jss';

import { globalize as globalizeStore } from '@demo/store';
import { globalize as globalizeRegistry } from '@demo/registry-ui';
import { globalize as globalizeRequest } from '@demo/request';
import { globalize as globalizeTheming } from '@demo/theming';
import { globalize as globalizeBricks } from '@demo/bricks/globalize';
import { globalize as globalizeUserDataManagement } from '@demo/user-data-management';
import { globalize as globalizeProjectDataManagement } from '@demo/project-data-management';
import { globalize as globalizeNotifications } from '@demo/notifications';
import { globalize as globalizeSearch } from '@demo/search';
import { globalize as globalizeLocalization } from '@demo/localization';
import { globalize as globalizeViewer } from '@demo/viewer-tools';

export default () => {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.ReactRouter = ReactRouter;
  window.ReactRouterDOM = ReactRouterDOM;
  window.jss = jss;

  globalizeRegistry();
  globalizeTheming();
  globalizeRequest();
  globalizeStore();
  globalizeBricks();
  globalizeUserDataManagement();
  globalizeProjectDataManagement();
  globalizeNotifications();
  globalizeSearch();
  globalizeLocalization();
  globalizeViewer();
};
