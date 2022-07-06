import { compact, uniq } from 'lodash';
import { messages } from '../localization';
import { OPERATORS } from '../definitions';

const baseItems = ['section', 'category', 'family', 'type', 'assembly', 'revitIds'];

const makeBase = (name, value, msg) => {
  const partName = msg(`elements.${name}`);

  return `( ${partName} = ${uniq(name === 'section' ? msg(`projectSection.${value}`) : value).join(
    `${name === 'section' ? '' : ', '}`
  )} )`;
};

export const getRuleDisplayString = (aggregation, msg) => {
  const baseInfo = baseItems.map(item =>
    (aggregation[item] || []).length > 0 ? makeBase(item, aggregation[item], msg) : undefined
  );

  const { conditions } = aggregation;
  const conditionsInfo = conditions.map(({ attribute, value, operator }) =>
    messages[`attribute.${attribute}`]
      ? `(${msg(`attribute.${attribute}`)} ${OPERATORS[operator]} ${value})`
      : `(${attribute} ${OPERATORS[operator]} ${value})`
  );

  const { isAssembly } = aggregation;

  let assText = '';

  if (isAssembly === true) {
    assText = msg('rule.applyForAssembly');
  }
  if (isAssembly === false) {
    assText = msg('rule.applyForElements');
  }

  return compact([...baseInfo, ...conditionsInfo, assText]).join(' & ');
};
