import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container, ContainerTitle, Tab, Tabs, TextField, Typography } from '@demo/bricks';
import { Search as IconSearch, Add as IconAdd } from '@demo/bricks/icons';
import { useIntl } from '@demo/localization';

import { useStyles } from './ResourcesSection.styles';
import { messages } from '../../../localization';
import { workDetailsActions } from '../../../redux/slices';
import { TableContentByRes } from './TableContentByRes';
import { TableContentByBase } from './TableContentByBase';

const GRID_TEMPLATE = [
  'minmax(80px, 1fr)',
  'minmax(90px, 2fr)',
  'minmax(40px, 60px)',
  'minmax(70px, 80px)',
  'minmax(50px, 80px)',
  'minmax(50px, 80px)',
  'minmax(50px, 90px)',
  'minmax(55px, 100px)',
];

const ResourcesSection = ({ canEdit, workDetails }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState(0);

  const handleAddRes = () => {
    dispatch(workDetailsActions.setIsAddByNormOpen.base({ isOpen: true }));
  };

  return (
    <div className={classes.section}>
      <ContainerTitle
        tag="h3"
        title={formatMessage(messages['workDetails.resources.title'])}
        padding="small"
        actions={[
          {
            hidden: !canEdit,
            label: '_Add',
            icon: <IconAdd />,
            onClick: handleAddRes,
            tooltip: formatMessage(messages['workDetails.resources.addTooltip']),
          },
        ]}
      />

      <Container paddingH="small">
        <TextField
          fullWidth
          variant="outlined"
          placeholder={formatMessage(messages.search)}
          endAdornment={<IconSearch />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </Container>

      <Container paddingH="small" paddingV="small">
        <Tabs styleVariant="underline" value={tab} onChange={(e, newTab) => setTab(newTab)}>
          <Tab
            label={
              <Typography weight="medium">{formatMessage(messages['workDetails.resources.tabs.byRes'])}</Typography>
            }
          />
          <Tab
            label={
              <Typography weight="medium">{formatMessage(messages['workDetails.resources.tabs.byBase'])}</Typography>
            }
          />
        </Tabs>
      </Container>

      {tab === 0 && (
        <TableContentByRes
          workDetails={workDetails}
          searchQuery={searchQuery}
          canEdit={canEdit}
          gridTemplate={GRID_TEMPLATE}
        />
      )}

      {tab === 1 && (
        <TableContentByBase
          workDetails={workDetails}
          searchQuery={searchQuery}
          canEdit={canEdit}
          gridTemplate={GRID_TEMPLATE}
        />
      )}
    </div>
  );
};

ResourcesSection.propTypes = {
  canEdit: PropTypes.bool,
  workDetails: PropTypes.object,
};

ResourcesSection.defaultProps = {
  canEdit: false,
  workDetails: {},
};

export { ResourcesSection };
