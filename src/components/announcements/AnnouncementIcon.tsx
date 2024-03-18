import React from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from '@components/common/Icon';

import { RED, PRIMARY_BLUE } from '@utils/colors';
import type { AnnouncementType } from './types';

type AnnouncementIconProps = {
  type: AnnouncementType;
};

const AnnouncementIcon: React.FC<AnnouncementIconProps> = ({ type }) => {
  const backgroundColor = type === 'crisis' ? RED : PRIMARY_BLUE;

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
    paddingBottom: 2,
  },
});

export default AnnouncementIcon;
