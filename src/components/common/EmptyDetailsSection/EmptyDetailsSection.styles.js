import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  emptySection: {
    height: spacing(25),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
