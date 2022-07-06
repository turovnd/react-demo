import { makeStyles } from '@demo/theming';

const ICON_COL_UNITS = 4.5;
const ICON_GAP = 2.5;

export const useStyles = makeStyles(({ spacing }) => ({
  section: {
    marginTop: spacing(2.5),
  },
  icon: {
    display: 'flex',
    columnGap: spacing(2.5),
    overflow: 'hidden',

    '& > :first-child': {
      width: spacing(ICON_COL_UNITS),
    },
  },
  iconShift: {
    marginLeft: spacing(ICON_GAP + ICON_COL_UNITS),
  },
}));
