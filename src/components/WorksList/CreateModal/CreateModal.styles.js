import { makeStyles } from '@demo/theming';

const commonBlock = {
  borderRadius: 15,
  width: 70,
  height: 70,
  flexShrink: 0,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > *': {
    fontSize: 28,
  },
};

export const useStyles = makeStyles(({ spacing, palette }) => ({
  itemContainer: {
    border: `2px solid ${palette.colors.N040}`,
    padding: spacing(5),
    borderRadius: 4,
    display: 'flex',
    cursor: 'pointer',
    marginTop: spacing(2.5),

    '&:hover': {
      backgroundColor: palette.action.hover,
    },

    '&:first-child': {
      marginTop: 0,
    },
  },
  iconColor1: {
    ...commonBlock,
    backgroundColor: palette.colors.P050,
  },
  iconColor2: {
    ...commonBlock,
    backgroundColor: palette.colors.T050,
  },
  iconColor3: {
    ...commonBlock,
    backgroundColor: palette.colors.Y050,
  },
  iconColor4: {
    ...commonBlock,
    backgroundColor: palette.colors.G050,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: spacing(2.5),
  },
}));
