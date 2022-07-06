import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ContainerTitle, FormFieldV2, TextField, Autocomplete } from '@demo/bricks';
import { useIntl } from '@demo/localization';

import { FIELD_GRID_TEMPLATE, useStyles } from './ParamsSection.styles';
import { I18N_UNITS, PROJECT_SECTIONS, WORK_TYPES } from '../../../definitions';
import { messages } from '../../../localization';
import { workDetailsSelectors } from '../../../redux/slices';

const ParamsSection = ({ canEdit, values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const isLoading = useSelector(workDetailsSelectors.selectIsLoading);

  const unitFieldLabel = useMemo(() => {
    let label = `${values.unitCoeff}`;

    const unitLabel = (I18N_UNITS.find(u => u.value === values.unitKey) || {}).label;

    label = `${label} ${messages[unitLabel] ? formatMessage(messages[unitLabel]) : unitLabel || '-'}`;

    return label;
  }, [values.unitCoeff, values.unitKey]);

  return (
    <div className={classes.section}>
      <ContainerTitle tag="h3" title={formatMessage(messages['workDetails.params.title'])} padding="small" />
      <FormFieldV2
        editable={canEdit}
        padding="small"
        loading={isLoading}
        label={formatMessage(messages['workDetails.params.code'])}
        gridTemplate={FIELD_GRID_TEMPLATE}
        formDisplayValue={values.code}
        Form={
          <TextField
            fullWidth
            name="code"
            value={values.code}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(!!errors.code && touched.code)}
            placeholder={formatMessage(messages['workDetails.params.placeholder.enter'])}
            helperText={messages[errors.code] && Boolean(touched.code) ? formatMessage(messages[errors.code]) : ''}
          />
        }
      />

      <FormFieldV2
        editable={canEdit}
        padding="small"
        loading={isLoading}
        label={formatMessage(messages['workDetails.params.section'])}
        gridTemplate={FIELD_GRID_TEMPLATE}
        formDisplayValue={
          messages[`projectSection.${values.section}`]
            ? formatMessage(messages[`projectSection.${values.section}`])
            : messages[`projectSection.${values.section}`]
        }
        Form={
          <Autocomplete
            name="section"
            fullWidth
            options={PROJECT_SECTIONS}
            value={values.section}
            onChange={(e, newVal) => setFieldValue('section', newVal)}
            onBlur={handleBlur}
            getOptionLabel={option =>
              messages[`projectSection.${option}`] ? formatMessage(messages[`projectSection.${option}`]) : option
            }
            renderInput={params => (
              <TextField
                {...params}
                error={Boolean(!!errors.section && touched.section)}
                helperText={
                  messages[errors.section] && Boolean(touched.section) ? formatMessage(messages[errors.section]) : ''
                }
                placeholder={formatMessage(messages['workDetails.params.placeholder.select'])}
              />
            )}
          />
        }
      />

      <FormFieldV2
        editable={canEdit}
        padding="small"
        loading={isLoading}
        label={formatMessage(messages['workDetails.params.type'])}
        placeholder={formatMessage(messages['workDetails.params.type'])}
        gridTemplate={FIELD_GRID_TEMPLATE}
        formDisplayValue={
          messages[`workTypes.${values.type}`]
            ? formatMessage(messages[`workTypes.${values.type}`])
            : messages[`workTypes.${values.type}`]
        }
        Form={
          <Autocomplete
            name="type"
            fullWidth
            options={WORK_TYPES}
            value={values.type}
            onChange={(e, newVal) => setFieldValue('type', newVal)}
            onBlur={handleBlur}
            getOptionLabel={option =>
              messages[`workTypes.${option}`] ? formatMessage(messages[`workTypes.${option}`]) : option
            }
            renderInput={params => (
              <TextField
                {...params}
                error={Boolean(!!errors.type && touched.type)}
                helperText={messages[errors.type] && Boolean(touched.type) ? formatMessage(messages[errors.type]) : ''}
                placeholder={formatMessage(messages['workDetails.params.placeholder.select'])}
              />
            )}
          />
        }
      />

      <FormFieldV2
        editable={canEdit}
        padding="small"
        loading={isLoading}
        label={formatMessage(messages['workDetails.params.unit'])}
        gridTemplate={FIELD_GRID_TEMPLATE}
        formDisplayValue={unitFieldLabel}
        Form={
          <div className={classes.fields}>
            <TextField
              readOnly={!canEdit}
              type="number"
              fullWidth
              name="unitCoeff"
              value={values.unitCoeff}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(!!errors.unitCoeff && touched.unitCoeff)}
              placeholder={formatMessage(messages['workDetails.params.placeholder.enter'])}
              helperText={
                messages[errors.unitCoeff] && Boolean(touched.unitCoeff)
                  ? formatMessage(messages[errors.unitCoeff])
                  : ''
              }
            />
            <Autocomplete
              name="unitKey"
              fullWidth
              disableClearable
              readOnly={!canEdit}
              options={I18N_UNITS}
              value={I18N_UNITS.find(v => v.value === values.unitKey)}
              onChange={(e, newVal) => setFieldValue('unitKey', newVal.value)}
              onBlur={handleBlur}
              getOptionLabel={option => (messages[option.label] ? formatMessage(messages[option.label]) : option.label)}
              renderInput={params => (
                <TextField
                  {...params}
                  error={Boolean(!!errors.unitKey && touched.unitKey)}
                  helperText={
                    messages[errors.unitKey] && Boolean(touched.unitKey) ? formatMessage(messages[errors.unitKey]) : ''
                  }
                  placeholder={formatMessage(messages['workDetails.params.placeholder.select'])}
                />
              )}
            />
          </div>
        }
      />
    </div>
  );
};

ParamsSection.propTypes = {
  canEdit: PropTypes.bool,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

ParamsSection.defaultProps = {
  canEdit: false,
};

export { ParamsSection };
