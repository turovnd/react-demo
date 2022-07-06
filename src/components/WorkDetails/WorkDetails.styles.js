import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing, mixins }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    position: 'absolute',
  },

  flexTable: {
    height: '100%',
    width: '100%',
  },

  section: {
    marginTop: spacing(2.5),
  },

  table: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'auto',
    ...mixins.scrollbars,
  },
}));
