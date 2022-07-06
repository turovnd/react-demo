import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  table: {
    height: '100%',
    width: '100%',
  },

  emptyHint: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
});
