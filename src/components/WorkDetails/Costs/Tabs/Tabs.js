import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Tab, Tabs as BricksTabs } from '@demo/bricks';

import { useFormatMessage } from '@demo/localization';
import { messages } from '../../../../localization';
import { costsCommonActions, costsCommonSelectors } from '../../../../redux/slices';
import { COSTS_TABS } from '../../../../definitions';

const Tabs = () => {
  const dispatch = useDispatch();
  const msg = useFormatMessage(messages);

  const tab = useSelector(costsCommonSelectors.selectTab);

  const handleChangeTab = (_, newTab) => {
    if (newTab !== tab) {
      dispatch(costsCommonActions.setTab.base({ tab: newTab }));
    }
  };

  return (
    <Container paddingH="small" paddingV="small">
      <BricksTabs styleVariant="underline" value={tab} onChange={handleChangeTab}>
        <Tab label={msg('costsList.tab.all')} value={COSTS_TABS.ALL} />
        <Tab label={msg('costsList.tab.linked')} value={COSTS_TABS.LINKED} />
      </BricksTabs>
    </Container>
  );
};

export { Tabs };
