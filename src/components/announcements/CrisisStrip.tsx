import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { State } from '@store/types';
import {
  selectCrisis,
  selectFetchTimestamp,
} from '@store/announcements/selectors';
import { fetchAnnouncements as fetchAnnouncementsAction } from '@store/announcements/actions';

import { LIGHT_RED, DARK_RED } from '@utils/colors';
import WarningsIcon from './WarningsIcon';

const mapStateToProps = (state: State) => ({
  crisis: selectCrisis(state),
  fetchTimestamp: selectFetchTimestamp(state),
});

const mapDispatchToProps = {
  fetchAnnouncements: fetchAnnouncementsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type CrisisStripProps = {
  style?: StyleProp<ViewStyle>;
} & PropsFromRedux;

const CrisisStrip: React.FC<CrisisStripProps> = ({
  style,
  crisis,
  fetchAnnouncements,
  fetchTimestamp,
}) => {
  const { t } = useTranslation('accessibility');
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

  if (!crisis || !enabled) {
    return null;
  }

  const linkRegex = new RegExp(/^http.*$/);

  const isLink = linkRegex.test(crisis.link);

  return (
    <View style={[style, styles.container]}>
      <WarningsIcon />
      {isLink ? (
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('openInBrowser')}
          onPress={() => Linking.openURL(crisis.link)}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, styles.link]}>
              {crisis.content}
              <Icon
                name="open-in-new"
                color={DARK_RED}
                height={18}
                style={styles.textIcon}
              />
            </Text>
          </View>
        </AccessibleTouchableOpacity>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{crisis.content}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: 'row',
    backgroundColor: LIGHT_RED,
  },
  text: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: DARK_RED,
    alignItems: 'flex-end',
  },
  textContainer: {
    marginLeft: 12,
    flexShrink: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  textIcon: {
    marginBottom: -3,
  },
});

export default connector(CrisisStrip);
