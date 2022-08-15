import React from 'react';
import Icon from '@components/common/Icon';

import { selectCurrentDayWarningData } from '@store/warnings/selectors';
import { State } from '@store/types';
import { connect } from 'react-redux';
import { Warning } from '@store/warnings/types';

const mapStateToProps = (state: State) => ({
  warningData: selectCurrentDayWarningData(state),
});

const connector = connect(mapStateToProps);

type WarningData = {
  date: number;
  severity: number;
  count: number;
  warnings: Warning[];
};

type Props = {
  color: string;
  size: number;
  warningData: WarningData[];
};

const getIconName = (severity: number): string => {
  switch (severity) {
    case 1:
      return 'warnings-yellow';
    case 2:
      return 'warnings-orange';
    case 3:
      return 'warnings-red';
    default:
      return 'warnings';
  }
};

const WarningsTabIcon: React.FC<Props> = ({ color, size, warningData }) => (
  <Icon
    name={getIconName(warningData[0].severity)}
    style={{ color }}
    width={size}
    height={size}
  />
);

export default connector(WarningsTabIcon);
