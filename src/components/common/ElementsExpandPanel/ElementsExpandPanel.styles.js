import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  modelNames: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: spacing(2.5),
  },
}));
