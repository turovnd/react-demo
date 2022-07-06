import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { ROUTE_NAMES } from '@demo/registry-ui/constants';
import { Dialog, Button, Typography } from '@demo/bricks';
import {
  Note as IconDoc,
  Formula as IconDocOnDoc,
  Math as IconCost,
  Bookshelf as IconNorms,
} from '@demo/bricks/icons';
import { useDispatch } from 'react-redux';
import { useFormatMessage } from '@demo/localization';
import { useNavigator } from '@demo/registry-ui/utils';

import { useStyles } from './CreateModal.styles';
import { messages } from '../../../localization';
import { costsCommonActions, workDetailsActions } from '../../../redux/slices';
import { COSTS_TABS } from '../../../definitions';

const CreateModal = ({ isOpen, onClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const { projectId } = useParams();
  const msg = useFormatMessage(messages);

  const handleClickCreate = () => {
    navigate(ROUTE_NAMES.WORKS_WORK_ADD, { projectId });
  };

  const handleClickByRule = () => {
    navigate(ROUTE_NAMES.WORKS_NEW_BY_RULE, { projectId });
  };

  const handleClickByCost = () => {
    navigate(ROUTE_NAMES.WORKS_WORK_ADD, { projectId });
    dispatch(
      costsCommonActions.setIsOpen.base({
        isCreatingWorkByCost: true,
        isOpen: true,
        tab: COSTS_TABS.ALL,
        costPositions: [],
      })
    );
  };

  const handleClickByNorm = () => {
    navigate(ROUTE_NAMES.WORKS_WORK_ADD, { projectId });
    dispatch(
      workDetailsActions.setIsAddByNormOpen.base({
        isCreatingWorkByNorm: true,
        isOpen: true,
      })
    );
  };

  return (
    <Dialog
      onClose={onClose}
      open={isOpen}
      title={msg('WorksList.CreateModal.title')}
      ActionsComponent={<Button onClick={onClose}>{msg('button.cancel')}</Button>}
    >
      <div className={classes.itemContainer} onClick={handleClickCreate}>
        <div className={classes.iconColor1}>
          <IconDoc />
        </div>

        <div className={classes.textContainer}>
          <Typography withMargin weight="medium">
            {msg('WorksList.CreateModal.create')}
          </Typography>
          <Typography>{msg('WorksList.CreateModal.createDescription')}</Typography>
        </div>
      </div>

      <div className={classes.itemContainer} onClick={handleClickByRule}>
        <div className={classes.iconColor2}>
          <IconDocOnDoc />
        </div>

        <div className={classes.textContainer}>
          <Typography withMargin weight="medium">
            {msg('WorksList.CreateModal.createByRule')}
          </Typography>
          <Typography>{msg('WorksList.CreateModal.createByRuleDescription')}</Typography>
        </div>
      </div>

      <div className={classes.itemContainer} onClick={handleClickByCost}>
        <div className={classes.iconColor3}>
          <IconCost />
        </div>

        <div className={classes.textContainer}>
          <Typography withMargin weight="medium">
            {msg('WorksList.CreateModal.createByCost')}
          </Typography>
          <Typography>{msg('WorksList.CreateModal.createByCostDescription')}</Typography>
        </div>
      </div>

      <div className={classes.itemContainer} onClick={handleClickByNorm}>
        <div className={classes.iconColor4}>
          <IconNorms />
        </div>

        <div className={classes.textContainer}>
          <Typography withMargin weight="medium">
            {msg('WorksList.CreateModal.createByNorm')}
          </Typography>
          <Typography>{msg('WorksList.CreateModal.createByNormDescription')}</Typography>
        </div>
      </div>
    </Dialog>
  );
};

CreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export { CreateModal };
