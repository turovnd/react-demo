export const getRuleKeywords = (rule, msg) => {
  const keywords = [];

  const baseItems = ['section', 'category', 'family', 'type', 'assembly', 'revitIds'];
  baseItems.forEach(item => ((rule[item] || []).length > 0 ? keywords.push(msg(`elements.${item}`)) : undefined));

  const { conditions } = rule;

  conditions.forEach(({ attribute }) => {
    keywords.push(msg(`attribute.${attribute}`));
  });

  return keywords;
};
