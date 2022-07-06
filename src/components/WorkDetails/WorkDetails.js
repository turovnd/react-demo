import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Prompt, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROUTE_NAMES } from '@demo/registry-ui';
import { ContainerTitle, Breadcrumbs } from '@demo/bricks';
import { useFormatMessage } from '@demo/localization';
import { useNavigator } from '@demo/registry-ui/utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useStyles } from './WorkDetails.styles';
import { ParamsSection } from './ParamsSection';
import { AggregationsSection } from './AggregationsSection';
import { VolumesSection } from './VolumesSection';
import { CostsSection } from './CostsSection';
import { ResourcesSection } from './ResourcesSection';
import {
  addResBySpecificationSelectors,
  costsCommonSelectors,
  workDetailsActions,
  workDetailsSelectors,
} from '../../redux/slices';
import { messages } from '../../localization';
import { WorkNameSection } from './WorkNameSection';
import { AddResByNorms } from './AddResByNorms';
import { AddResByCatalog } from './AddResByCatalog';
import { AddResBySpecification } from './AddResBySpecification';
import { Costs } from './Costs';
import { ElementsExpandPanel } from '../common/ElementsExpandPanel';
import { I18N_UNITS } from '../../definitions';

const validationSchema = Yup.object({
  name: Yup.string().required('__REQUIRED__'),
  code: Yup.string().required('__REQUIRED__'),
  type: Yup.string().required('__REQUIRED__'),
  section: Yup.string().required('__REQUIRED__'),
  unitCoeff: Yup.string().required('__REQUIRED__'),
  unitKey: Yup.mixed()
    .oneOf(Object.values(I18N_UNITS.map(unit => unit.value)))
    .required('__REQUIRED__'),
});

const WorkDetails = ({ isCreating }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const msg = useFormatMessage(messages);
  const { projectId, workId } = useParams();
  const query = new URLSearchParams(useLocation().search);

  const titleRef = useRef();
  const skipPrompt = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const [selectedAggr, setSelectedAggr] = useState([]);
  const [isAggrOpen, setIsAggrOpen] = useState(false);

  const isEditing = useSelector(workDetailsSelectors.selectIsEditing);
  const isSubmitting = useSelector(workDetailsSelectors.selectIsSubmitting);
  const isCostsViewOpen = useSelector(costsCommonSelectors.selectIsOpen);
  const isAddByNormsOpen = useSelector(workDetailsSelectors.selectIsAddByNormsOpen);
  const isAddByCatalogOpen = useSelector(workDetailsSelectors.selectIsAddByCatalogOpen);
  const isAddBySpecificationOpen = useSelector(addResBySpecificationSelectors.selectIsOpen);
  const workDetails = useSelector(workDetailsSelectors.selectDetails);

  useEffect(() => {
    // Do not get details on create work.
    if (!isCreating) {
      dispatch(workDetailsActions.getWorkDetails.base({ msg, projectId, workId }));
    }

    return () => {
      dispatch(workDetailsActions.devitalize.base());
    };
  }, []);

  const handleEdit = () => {
    dispatch(workDetailsActions.setIsEditing.base({ editing: true }));
  };

  const handleSubmit = values => {
    if (isSubmitting) return;

    skipPrompt.current = true;

    if (isCreating) {
      dispatch(
        workDetailsActions.createWork.base({
          projectId,
          values,
          onSuccess: wId => navigate(ROUTE_NAMES.WORKS_WORK_DETAILS, { projectId, workId: wId }),
          successMessage: msg('notifications.workDetails.createWork'),
          onFinally: () => {
            skipPrompt.current = false;
          },
        })
      );
    }

    if (isEditing) {
      dispatch(
        workDetailsActions.editWork.base({
          projectId,
          values,
          workId,
          successMessage: msg('notifications.workDetails.editWork'),
          onFinally: () => {
            skipPrompt.current = false;
          },
        })
      );
    }
  };

  const formikBag = useFormik({
    initialValues: {
      name: workDetails.name,
      code: workDetails.code,
      type: workDetails.type,
      section: workDetails.section,
      unitCoeff: workDetails.unitCoeff,
      unitKey: workDetails.unitKey,
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const handleCancel = () => {
    if (isSubmitting) return;

    if (isCreating) {
      navigate(ROUTE_NAMES.WORKS, { projectId }, { workId, workIndex: query.get('workIndex') });
    }

    if (isEditing) {
      formikBag.resetForm();
      dispatch(workDetailsActions.setIsEditing.base({ editing: false }));
    }
  };

  if (isCostsViewOpen) {
    return <Costs isCreating={isCreating} />;
  }

  if (isAddByNormsOpen) {
    return <AddResByNorms isCreating={isCreating} />;
  }

  if (isAddByCatalogOpen) {
    return <AddResByCatalog isCreating={isCreating} />;
  }

  if (isAddBySpecificationOpen) {
    return <AddResBySpecification isCreating={isCreating} />;
  }
  return (
    <div className={classes.root}>
      <Prompt message={msg('notification.sureToLeave')} when={!skipPrompt.current && (isEditing || isCreating)} />

      <ContainerTitle
        tag="h1"
        padding="small"
        title={msg(isCreating ? 'workDetails.titleCreate' : 'workDetails.title')}
        subtitle={
          <Breadcrumbs
            items={[
              {
                label: msg('worksList.title'),
                onClick: () =>
                  navigate(ROUTE_NAMES.WORKS, { projectId }, { workId, workIndex: query.get('workIndex') }),
              },
            ]}
          />
        }
        actions={[
          {
            hidden: !isEditing && !isCreating,
            label: msg('button.cancel'),
            onClick: handleCancel,
          },
          {
            hidden: !isEditing && !isCreating,
            label: msg('button.save'),
            variant: 'contained',
            color: 'primary',
            onClick: formikBag.handleSubmit,
            loading: isSubmitting,
          },
          {
            hidden: isEditing || isCreating,
            label: msg('button.edit'),
            variant: 'contained',
            onClick: handleEdit,
          },
        ]}
      />

      <WorkNameSection forwardRef={titleRef} isCreating={isCreating} {...formikBag} />

      <div className={classes.table}>
        <ParamsSection canEdit={(isEditing || isCreating) && !isSubmitting} {...formikBag} />

        <AggregationsSection
          onSelect={setSelectedAggr}
          selected={selectedAggr.map(s => s._id)}
          isCreating={isCreating}
          canEdit={(isEditing || isCreating) && !isSubmitting}
          isAggrOpen={isAggrOpen}
          setIsAggrOpen={setIsAggrOpen}
          values={formikBag.values}
        />

        <VolumesSection />

        <CostsSection canEdit={(isEditing || isCreating) && !isSubmitting} />

        <ResourcesSection workDetails={formikBag.values} canEdit={(isEditing || isCreating) && !isSubmitting} />
      </div>

      {!isAggrOpen && (
        <ElementsExpandPanel
          staticExpand
          isExpanded={expanded}
          setIsExpanded={setExpanded}
          ruleData={selectedAggr[0]}
        />
      )}
    </div>
  );
};

WorkDetails.propTypes = {
  isCreating: PropTypes.bool,
};

WorkDetails.defaultProps = {
  isCreating: false,
};

export { WorkDetails };
