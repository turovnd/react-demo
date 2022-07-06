import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  root: {
    minHeight: spacing(9),
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-end',
    padding: spacing(0, 2.5),
  },
  fullWidth: {
    width: '100%',
  },
}));
