import React from 'react';
import PropTypes from 'prop-types';
import { BookBend as IconBook } from '@demo/bricks/icons';
import { Checkbox, TableRow, Typography, Tooltip, Button } from '@demo/bricks';
import { preventClickThrough } from '@demo/bricks/utils';
import { useFormatMessage } from '@demo/localization';

import { useStyles } from './SectionName.styles';
import { messages } from '../../../localization';

const SectionName = ({ style, text, number, checkbox, search, ...props }) => {
  const classes = useStyles();
  const msg = useFormatMessage(messages);

  const isCheckboxShowed = checkbox !== undefined;

  const getStartAdornment = () => {
    if (!isCheckboxShowed) return null;

    const checkboxComponent = (
      <Checkbox
        disabled={checkbox.disabled}
        onClick={e => preventClickThrough(e)}
        checked={checkbox.checked}
        indeterminate={checkbox.indeterminate}
        onChange={checkbox.onChange}
      />
    );

    if (checkbox.disabled) {
      return (
        <div>
          <Tooltip
            interactive
            title={
              // Prevent click bubbling to row.
              <div className={classes.tooltip} onClick={e => preventClickThrough(e)}>
                <Typography>{msg('common.SectionName.loadAllRows')}</Typography>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => (checkbox.loadAll ? checkbox.loadAll() : undefined)}
                >
                  {msg('button.load')}
                </Button>
              </div>
            }
          >
            {/* Add wrapper div to allow show tooltip on disabled checkbox.  */}
            {/* TODO: make our custom checkbox component. */}
            <div>{checkboxComponent}</div>
          </Tooltip>
        </div>
      );
    }

    return checkboxComponent;
  };

  return (
    <TableRow centered style={style} className={classes.root} {...props} startAdornment={getStartAdornment()}>
      <IconBook />
      <Typography mark={search ? { search } : undefined} noWrap tooltip>
        {text}
      </Typography>
      <Typography className={classes.number} variant="number">
        {number}
      </Typography>
    </TableRow>
  );
};

SectionName.propTypes = {
  number: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  search: PropTypes.string,
  checkbox: PropTypes.shape({
    loadAll: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    indeterminate: PropTypes.bool,
    onChange: PropTypes.func,
  }).isRequired,
};

SectionName.defaultProps = {
  search: undefined,
};

export { SectionName };
