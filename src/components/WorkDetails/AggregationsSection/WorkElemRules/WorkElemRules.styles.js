import { makeStyles } from '@demo/theming';

export const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: palette.background.default,
    zIndex: 1,
  },
  codeBlock: {
    paddingBottom: spacing(2.5),
  },
  nameBlock: {
    padding: spacing(0, 2.5),
  },
}));
