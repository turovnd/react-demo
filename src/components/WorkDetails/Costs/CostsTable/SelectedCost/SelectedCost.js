import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { CommonRow, TemplateHeader, Typography } from '@demo/bricks';

import { useFormatMessage } from '@demo/localization';
import { GRID_TEMPLATE } from '../CostsList';
import { costsCommonSelectors } from '../../../../../redux/slices';
import { messages } from '../../../../../localization';

const SelectedCost = () => {
  const msg = useFormatMessage(messages);
  const cost = useSelector(costsCommonSelectors.selectCost);

  return (
    <Fragment>
      <TemplateHeader
        template={[
          { size: GRID_TEMPLATE[0], value: msg('costsList.allTable.type') },
          { size: GRID_TEMPLATE[1], value: msg('costsList.allTable.name') },
          { size: GRID_TEMPLATE[2], value: msg('costsList.allTable.contractor') },
        ]}
      />
      <CommonRow
        template={[
          {
            size: GRID_TEMPLATE[0],
            value: (
              <Typography tooltip lineClamp={2}>
                {msg(`contragentType.${cost.contragentType}`)}
              </Typography>
            ),
          },
          {
            size: GRID_TEMPLATE[1],
            value: (
              <Typography tooltip lineClamp={2}>
                {cost.name}
              </Typography>
            ),
          },
          {
            size: GRID_TEMPLATE[2],
            value: (
              <Typography tooltip lineClamp={2}>
                {cost.contragentName || '-'}
              </Typography>
            ),
          },
        ]}
      />
    </Fragment>
  );
};

export { SelectedCost };
