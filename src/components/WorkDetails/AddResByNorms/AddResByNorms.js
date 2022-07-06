import React, { useState } from 'react';
import { Breadcrumbs, Container, ContainerTitle, Tooltip, Typography, Link } from '@demo/bricks';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { ROUTE_NAMES, MicroFrontend } from '@demo/registry-ui';
import { catalogs } from '@demo/registry-ui/applications';
import { useFormatMessage } from '@demo/localization';
import { useParams } from 'react-router-dom';
import { Info as IconInfo } from '@demo/bricks/icons';
import { useNavigator } from '@demo/registry-ui/utils';
import AutoSizer from 'react-virtualized-auto-sizer';
import { workDetailsActions, workDetailsSelectors } from '../../../redux/slices';
import { messages } from '../../../localization';
import { useStyles } from '../WorkDetails.styles';
import { MicrofrontendLoader } from '../../MicrofrontendLoader';

const AddResByNorms = ({ isCreating }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const msg = useFormatMessage(messages);
  const { projectId } = useParams();

  const isCreatingWorkByNorm = useSelector(workDetailsSelectors.selectIsCreatingWorkByNorm);

  const [selection, setSelection] = useState([]);

  const handleClose = () => {
    if (isCreatingWorkByNorm) {
      navigate(ROUTE_NAMES.WORKS, { projectId });
    } else {
      dispatch(workDetailsActions.setIsAddByNormOpen.base({ isOpen: false }));
    }
  };

  const handleSubmit = () => {
    dispatch(workDetailsActions.addWorkResourcesByNorm.base({ norms: selection }));
    dispatch(workDetailsActions.setIsAddByNormOpen.base({ isOpen: false }));

    // If creating work by norm - set work data like name, unit ...
    if (isCreatingWorkByNorm) {
      const firstSelectedNorm = (selection || [])[0] || {};
      dispatch(
        workDetailsActions.setWorkParams.base({
          name: firstSelectedNorm.name,
          code: firstSelectedNorm.code,
          unitCoeff: firstSelectedNorm.unitCoeff,
          unitKey: firstSelectedNorm.unitKey,
        })
      );
    }
  };

  return (
    <div className={classes.root}>
      <ContainerTitle
        tag="h1"
        padding="small"
        title={msg(
          isCreatingWorkByNorm ? 'WorkDetails.Norms.titleAddWorkByNorm' : 'workDetails.resources.addByNorm.title'
        )}
        subtitle={
          <Breadcrumbs
            items={
              isCreatingWorkByNorm
                ? [
                    {
                      label: msg('worksList.title'),
                      onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
                    },
                  ]
                : [
                    {
                      label: msg('worksList.title'),
                      onClick: () => navigate(ROUTE_NAMES.WORKS, { projectId }),
                    },
                    {
                      label: msg(isCreating ? 'workDetails.titleCreate' : 'workDetails.title'),
                      onClick: handleClose,
                    },
                  ]
            }
          />
        }
        actions={[
          {
            label: msg('button.cancel'),
            onClick: handleClose,
          },
          {
            label: msg(isCreatingWorkByNorm ? 'button.continue' : 'button.save'),
            variant: 'contained',
            color: 'primary',
            onClick: handleSubmit,
            disabled: selection.length === 0,
          },
        ]}
      />

      <Container paddingH="small">
        <MicroFrontend
          id={catalogs.id}
          routePath={catalogs.fragments.normsSelectionSearch}
          LoadingComponent={() => <MicrofrontendLoader type="search" />}
        />
      </Container>

      <ContainerTitle
        className={classes.section}
        title={msg('WorkDetails.AddResByNorms.header')}
        padding="small"
        helpText={
          <Tooltip
            interactive
            title={
              <div>
                <Typography>{msg('WorkDetails.AddResByNorms.headerTooltip')}</Typography>
                <br />
                <Link color="primary" onClick={() => navigate(ROUTE_NAMES.CATALOGS_NORMS, {})}>
                  {msg('hint.navigate')}
                </Link>
              </div>
            }
          >
            <div>
              <IconInfo />
            </div>
          </Tooltip>
        }
      />

      <div className={classes.flexTable}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <MicroFrontend
              id={catalogs.id}
              routePath={catalogs.fragments.normsSelection}
              LoadingComponent={() => <MicrofrontendLoader height={height} type="table" />}
              height={height}
              selection={selection.map(norm => norm._id)}
              onSelect={norm => {
                const alreadySelected = selection.find(n => n._id === norm._id);
                setSelection(alreadySelected ? selection.filter(n => n._id !== norm._id) : [...selection, norm]);
              }}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

AddResByNorms.propTypes = {
  isCreating: PropTypes.bool,
};

AddResByNorms.defaultProps = {
  isCreating: false,
};

export { AddResByNorms };
