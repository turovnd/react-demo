import PropTypes from 'prop-types';
import React from 'react';
import { Typography } from '@demo/bricks';

import { useFormatMessage } from '@demo/localization';
import { useStyles } from './EmptyDetailsSection.styles';
import { messages } from '../../../localization';

const EmptyDetailsSection = ({ canEdit }) => {
  const classes = useStyles();
  const msg = useFormatMessage(messages);

  return (
    <div className={classes.emptySection}>
      <Typography color="hint" variant="caption">
        {msg(canEdit ? 'workDetails.rules.empty' : 'workDetails.rules.emptyNeedEdit')}
      </Typography>
    </div>
  );
};

EmptyDetailsSection.propTypes = {
  canEdit: PropTypes.bool.isRequired,
};

export { EmptyDetailsSection };
