import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  normHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: spacing(2.5),
    columnGap: spacing(10),
    cursor: 'pointer',
    height: spacing(14),
    justifyContent: 'space-between',
  },
}));
