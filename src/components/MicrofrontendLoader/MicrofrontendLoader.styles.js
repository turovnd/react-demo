import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles({
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },

  skeleton: {
    width: '100%',
    height: 36,
  },
});
