import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing }) => ({
  positionRowCol: {
    marginLeft: spacing(7),
    display: 'flex',
    alignItems: 'flex-start',

    '& > :not(:first-child)': {
      marginLeft: spacing(2.5),
    },
  },
}));
