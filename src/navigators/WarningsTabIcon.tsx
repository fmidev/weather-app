import React, { useEffect } from 'react';
import Icon from '@components/common/ScalableIcon';

import { selectCurrentDayWarningData } from '@store/warnings/selectors';
import { selectTheme } from '@store/settings/selectors';
import { State } from '@store/types';
import { connect } from 'react-redux';
import { Warning } from '@store/warnings/types';
import { useTheme } from '@react-navigation/native';

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
  warningData: WarningData[];
  updateWarningsSeverity: Function;
};

const getIconName = (severity: number, dark: boolean): string => {
  switch (severity) {
    case 1:
      return `warnings-yellow-${dark ? 'dark' : 'light'}`;
    case 2:
      return `warnings-orange-${dark ? 'dark' : 'light'}`;
    case 3:
      return `warnings-red-${dark ? 'dark' : 'light'}`;
    default:
      return 'warnings';
  }
};

const WarningsTabIcon: React.FC<Props> = ({
  color,
  size,
  warningData,
  updateWarningsSeverity,
}) => {
  const { dark } = useTheme();

  useEffect(() => {
    updateWarningsSeverity(warningData[0].severity);
  }, [warningData, updateWarningsSeverity]);

  return (
    <Icon
      name={getIconName(warningData[0].severity, dark)}
      style={{ color }}
      width={size}
      height={size}
      maxScaleFactor={1.2}
    />
  );
};

export default connector(WarningsTabIcon);
