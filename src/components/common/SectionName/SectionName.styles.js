import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  number: {
    marginLeft: 'auto',
  },
  tooltip: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: spacing(2.5),
  },
}));
