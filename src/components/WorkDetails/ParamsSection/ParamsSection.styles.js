import { makeStyles } from '@demo/theming';

export const FIELD_GRID_TEMPLATE = ['minmax(120px, 1fr)', 'minmax(200px, 2fr)'];

export const useStyles = makeStyles(({ spacing }) => ({
  section: {
    marginTop: spacing(2.5),
  },
  fields: {
    display: 'grid',
    width: '100%',
    columnGap: spacing(2.5),
    alignItems: 'flex-start',
    gridTemplateColumns: '1fr 100px',
  },
}));
