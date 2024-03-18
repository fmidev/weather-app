import React, { useCallback, useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';

import AnnouncementStrip from './AnnouncementStrip';
import { State } from '@store/types';
import {
  selectCrisis,
  selectFetchTimestamp,
} from '@store/announcements/selectors';
import { fetchAnnouncements as fetchAnnouncementsAction } from '@store/announcements/actions';

const mapStateToProps = (state: State) => ({
  crisis: selectCrisis(state),
  fetchTimestamp: selectFetchTimestamp(state),
});

const mapDispatchToProps = {
  fetchAnnouncements: fetchAnnouncementsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnouncementsProps = {
  style?: StyleProp<ViewStyle>;
} & PropsFromRedux;

const Announcements: React.FC<AnnouncementsProps> = ({
  style,
  fetchAnnouncements,
  fetchTimestamp,
}) => {
  const { shouldReload } = useReloader();
  const isFocused = useIsFocused();

  const { updateInterval, enabled } = Config.get('announcements');

  const updateAnnouncements = useCallback(() => {
    if (enabled) {
      fetchAnnouncements();
    }
  }, [fetchAnnouncements, enabled]);

  useEffect(() => {
    const now = Date.now();
    const updateTime = fetchTimestamp + (updateInterval ?? 5) * 60 * 1000;
    if (isFocused) {
      if (now > updateTime || shouldReload > updateTime) {
        updateAnnouncements();
      }
    }
  }, [
    isFocused,
    fetchTimestamp,
    shouldReload,
    updateInterval,
    updateAnnouncements,
  ]);

  return (
    <View style={style}>
      <AnnouncementStrip type="crisis" />
      <AnnouncementStrip type="maintenance" />
    </View>
  );
};

export default connector(Announcements);
