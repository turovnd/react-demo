import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ palette }) => ({
  row: {
    '&:last-child': {
      borderBottom: `1px solid ${palette.divider}`,
    },
  },
  checkbox: {
    height: 'fit-content',
  },
}));
