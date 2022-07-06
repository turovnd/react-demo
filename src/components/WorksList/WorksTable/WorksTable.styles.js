import { makeStyles } from '@demo/theming';

export const ANIMATION_ROW_PULSE_DURATION = 2000;

export const useStyles = makeStyles(({ palette, spacing }) => ({
  breakAll: {
    wordBreak: 'break-all',
  },

  endAdornment: {
    top: spacing(1),
  },

  codeCell: {
    display: 'flex',
    columnGap: spacing(2.5),
  },

  skeleton: {
    flexShrink: 0,
  },

  scrollToRowPulse: {
    animationName: '$pulse',
    animationDuration: `${ANIMATION_ROW_PULSE_DURATION}ms`,
    animationIterationCount: 1,
  },

  '@keyframes pulse': {
    '0%': {
      backgroundColor: palette.background.default,
    },
    '50%': {
      backgroundColor: palette.warning.main,
    },
    '100%': {
      backgroundColor: palette.background.default,
    },
  },
}));
