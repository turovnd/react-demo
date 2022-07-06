import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { MicroFrontend } from '@demo/registry-ui';
import { costsUi } from '@demo/registry-ui/applications';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Container, ContainerTitle } from '@demo/bricks';
import { useFormatMessage } from '@demo/localization';

import { costsAllTableActions, costsCommonActions, costsCommonSelectors } from '../../../../redux/slices';
import { CostsList } from './CostsList';
import { messages } from '../../../../localization';
import { SelectedCost } from './SelectedCost';
import { SearchField } from './SearchField';
import { Tabs } from '../Tabs';
import { useStyles } from './CostsTable.styles';
import { MicrofrontendLoader } from '../../../MicrofrontendLoader';

const CostsTable = ({ isCreating }) => {
  const dispatch = useDispatch();
  const msg = useFormatMessage(messages);
  const classes = useStyles();
  const { projectId } = useParams();

  const cost = useSelector(costsCommonSelectors.selectCost);
  const selectedPositions = useSelector(costsCommonSelectors.selectSelectedPositions);

  useEffect(() => () => dispatch(costsAllTableActions.devitalize.base()), []);

  return (
    <Fragment>
      <Container paddingH="small">
        <SearchField />
      </Container>

      {!cost && !isCreating && <Tabs />}

      {cost && (
        <Fragment>
          <ContainerTitle padding="small" title={msg('costsList.selectedCost')} />
          <SelectedCost />

          <ContainerTitle padding="small" title={msg('costsList.positions')} />
        </Fragment>
      )}

      <div className={classes.table}>
        <AutoSizer disableWidth>
          {({ height }) =>
            cost ? (
              <MicroFrontend
                id={costsUi.id}
                routePath={costsUi.fragments.costsSelection}
                LoadingComponent={() => <MicrofrontendLoader height={height} type="table" />}
                isSelectable
                onlyNorms
                noActions
                projectId={projectId}
                costId={cost._id}
                height={height}
                selection={selectedPositions.map(pos => pos._id)}
                onSelect={norm => {
                  dispatch(
                    costsCommonActions.toggleSelectedPositions.base({ positions: [{ ...norm, costDetails: cost }] })
                  );
                }}
              />
            ) : (
              <CostsList tableHeight={height} />
            )
          }
        </AutoSizer>
      </div>
    </Fragment>
  );
};

CostsTable.propTypes = {
  isCreating: PropTypes.bool.isRequired,
};

export { CostsTable };
