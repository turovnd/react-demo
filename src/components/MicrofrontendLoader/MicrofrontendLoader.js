import PropTypes from 'prop-types';
import React from 'react';
import { CircularProgress, Skeleton } from '@demo/bricks';

import { useStyles } from './MicrofrontendLoader.styles';

const MicrofrontendLoader = React.memo(({ height, type }) => {
  const classes = useStyles();

  if (type === 'search') {
    return (
      <div className={classes.loader}>
        <Skeleton className={classes.skeleton} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ height }} className={classes.loader}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return null;
});

MicrofrontendLoader.propTypes = {
  height: PropTypes.number,
  type: PropTypes.oneOf(['table', 'search']),
};

MicrofrontendLoader.defaultProps = {
  height: undefined,
  type: undefined,
};

export { MicrofrontendLoader };
