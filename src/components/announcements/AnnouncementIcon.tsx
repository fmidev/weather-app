import React from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from '@components/common/Icon';

import { RED, PRIMARY_BLUE } from '@utils/colors';
import type { AnnouncementType } from './types';

type AnnouncementIconProps = {
  type: AnnouncementType;
};

const AnnouncementIcon: React.FC<AnnouncementIconProps> = ({ type }) => {
  return (
    <View
      style={[
        ...(type === 'crisis' ? [styles.crisis] : [styles.maintenance]),
        styles.container,
      ]}>
      <Icon
        name={
          type === 'crisis' ? 'crisis-strip-icon' : 'maintenance-strip-icon'
        }
        height={18}
        width={18}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crisis: {
    paddingBottom: 2,
    backgroundColor: RED,
  },
  maintenance: {
    backgroundColor: PRIMARY_BLUE,
  },
});

export default AnnouncementIcon;
