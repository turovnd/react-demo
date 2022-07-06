import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Skeleton, TextField } from '@demo/bricks';
import { useIntl } from '@demo/localization';

import { useStyles } from './WorkNameSection.styles';
import { workDetailsSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';

const WorkNameSection = ({ isCreating, forwardRef, values, errors, touched, handleChange, handleBlur }) => {
  const classes = useStyles();
  const { formatMessage } = useIntl();

  // const details = useSelector(workDetailsSelectors.selectDetails);
  const isLoading = useSelector(workDetailsSelectors.selectIsLoading);
  const isEditing = useSelector(workDetailsSelectors.selectIsEditing);

  return (
    <div className={classes.root} ref={forwardRef}>
      {isLoading ? (
        <Skeleton className={classes.fullWidth} />
      ) : (
        <TextField
          name="name"
          fullWidth
          multiline
          readOnly={!isCreating && !isEditing}
          placeholder={formatMessage(messages['workDetails.textField.placeholder'])}
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(!!errors.name && touched.name)}
          helperText={messages[errors.name] && Boolean(touched.name) ? formatMessage(messages[errors.name]) : ''}
        />
      )}
    </div>
  );
};

WorkNameSection.propTypes = {
  forwardRef: PropTypes.object.isRequired,
  isCreating: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  touched: PropTypes.object.isRequired,
};

export { WorkNameSection };
