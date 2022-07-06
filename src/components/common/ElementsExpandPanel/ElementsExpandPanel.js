/* eslint-disable  no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DefaultTheme } from '@demo/theming';
import { ElementsBrowser } from '@demo/elements-selection';

const ElementsExpandPanel = ({
  joinArtefactRules,
  onChange,
  onSelect,
  onChangeHeight,
  artefact,
  section,
  expandHeight,
  isExpanded,
  setIsExpanded,
  setExpandHeight,
  staticExpand,
  ruleData,
  rule,
  setArtefactRuleEditingMode,
  isArtefactRuleEditingMode,
}) => {
  const { projectId } = useParams();

  useEffect(() => {
    if (onChangeHeight) {
      onChangeHeight(isExpanded ? expandHeight : DefaultTheme.spacing(14));
    }
  }, [expandHeight, isExpanded]);

  return (
    <ElementsBrowser
      showSelectedText
      projectId={projectId}
      artefact={artefact}
      rule={
        rule || {
          hidden: !(artefact || {}).id,
          section,
          joinArtefactRules,
          rule: ruleData,
        }
      }
      ExpandPanelProps={{
        expanded: isExpanded,
        onChange: setIsExpanded,
        onChangeHeight: setExpandHeight,
        staticExpand,
      }}
      onChange={onChange}
      onSelect={onSelect}
      toggleArtefactRuleEditingMode={flag => setArtefactRuleEditingMode(flag)}
      isArtefactRuleEditing={isArtefactRuleEditingMode}
    />
  );
};

ElementsExpandPanel.propTypes = {
  joinArtefactRules: PropTypes.bool,
  section: PropTypes.string,
  artefact: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
  }),
  rule: PropTypes.object,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onChangeHeight: PropTypes.func,
  expandHeight: PropTypes.number,
  isExpanded: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  setExpandHeight: PropTypes.func.isRequired,
  setArtefactRuleEditingMode: PropTypes.func,
  isArtefactRuleEditingMode: PropTypes.bool,
  staticExpand: PropTypes.bool,
  ruleData: PropTypes.object,
};

ElementsExpandPanel.defaultProps = {
  joinArtefactRules: false,
  section: undefined,
  expandHeight: undefined,
  artefact: undefined,
  onChange: undefined,
  onSelect: undefined,
  onChangeHeight: undefined,
  staticExpand: undefined,
  ruleData: undefined,
  rule: undefined,
  setArtefactRuleEditingMode: undefined,
  isArtefactRuleEditingMode: undefined,
};

export { ElementsExpandPanel };
