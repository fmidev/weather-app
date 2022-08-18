import React from 'react';
import Icon from '@components/common/Icon';

import { selectCurrentDayWarningData } from '@store/warnings/selectors';
import { selectTheme } from '@store/settings/selectors';
import { State } from '@store/types';
import { connect } from 'react-redux';
import { Warning } from '@store/warnings/types';
import { Theme } from '@store/settings/types';

const mapStateToProps = (state: State) => ({
  warningData: selectCurrentDayWarningData(state),
  theme: selectTheme(state),
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
  theme: Theme;
  warningData: WarningData[];
};

const getIconName = (severity: number, theme: Theme): string => {
  switch (severity) {
    case 1:
      return `warnings-yellow${theme === 'dark' ? '-dark' : ''}`;
    case 2:
      return `warnings-orange${theme === 'dark' ? '-dark' : ''}`;
    case 3:
      return `warnings-red${theme === 'dark' ? '-dark' : ''}`;
    default:
      return 'warnings';
  }
};

const WarningsTabIcon: React.FC<Props> = ({
  color,
  theme,
  size,
  warningData,
}) => (
  <Icon
    name={getIconName(warningData[0].severity, theme)}
    style={{ color }}
    width={size}
    height={size}
  />
);

export default connector(WarningsTabIcon);
