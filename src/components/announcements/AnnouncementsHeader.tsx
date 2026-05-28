import React from 'react';
import { StyleSheet } from 'react-native';
import { Header as StackHeader, type StackHeaderProps } from '@react-navigation/stack';
import { connect, ConnectedProps } from 'react-redux';

import { Config } from '@config';
import { State } from '@store/types';
import {
  selectCrisis,
  selectMaintenance,
} from '@store/announcements/selectors';

import Announcements from './Announcements';

const mapStateToProps = (state: State) => ({
  crisis: selectCrisis(state),
  maintenance: selectMaintenance(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnouncementsHeaderProps = StackHeaderProps & PropsFromRedux;

const AnnouncementsHeader: React.FC<AnnouncementsHeaderProps> = ({
  crisis,
  maintenance,
  options,
  ...headerProps
}) => {
  const hasAnnouncements =
    Config.get('announcements').enabled && (crisis || maintenance);

  return (
    <>
      {hasAnnouncements && (
        <Announcements includeTopInset style={styles.announcements} />
      )}
      <StackHeader
        {...headerProps}
        options={{
          ...options,
          headerStatusBarHeight: hasAnnouncements
            ? 0
            : options.headerStatusBarHeight,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  announcements: {
    width: '100%',
  },
});

export default connector(AnnouncementsHeader);
