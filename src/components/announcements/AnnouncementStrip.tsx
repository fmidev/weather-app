import React from 'react';
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

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { Config } from '@config';
import { State } from '@store/types';
import {
  selectCrisis,
  selectMaintenance,
  selectFetchTimestamp,
} from '@store/announcements/selectors';
import { fetchAnnouncements as fetchAnnouncementsAction } from '@store/announcements/actions';

import { LIGHT_RED, DARK_RED, LIGHT_BLUE, PRIMARY_BLUE } from '@utils/colors';
import AnnouncementIcon from './AnnouncementIcon';
import type { AnnouncementType } from './types';

const mapStateToProps = (state: State) => ({
  crisis: selectCrisis(state),
  maintenance: selectMaintenance(state),
  fetchTimestamp: selectFetchTimestamp(state),
});

const mapDispatchToProps = {
  fetchAnnouncements: fetchAnnouncementsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnouncementStripProps = {
  style?: StyleProp<ViewStyle>;
  type: AnnouncementType;
} & PropsFromRedux;

const AnnouncementStrip: React.FC<AnnouncementStripProps> = ({
  style,
  type,
  crisis,
  maintenance,
}) => {
  const { t } = useTranslation('announcements');
  const { enabled } = Config.get('announcements');

  const announcement = type === 'crisis' ? crisis : maintenance;
  const backgroundColor = type === 'crisis' ? LIGHT_RED : LIGHT_BLUE;
  const textColor = type === 'crisis' ? DARK_RED : PRIMARY_BLUE;
  const prefix = type === 'crisis' ? t('crisisPrefix') : t('maintenancePrefix');

  if (!announcement || !enabled) {
    return null;
  }

  const linkRegex = new RegExp(/^http.*$/);

  const isLink = linkRegex.test(announcement.link);

  return (
    <View style={[style, styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <AnnouncementIcon type={type} />
      </View>
      {isLink ? (
        <AccessibleTouchableOpacity
          style={styles.touchable}
          accessibilityRole="link"
          accessibilityHint={t('openInBrowser')}
          onPress={() => Linking.openURL(announcement.link)}>
          <View style={[styles.textContainer]}>
            <Text
              style={[styles.text, styles.link, { color: textColor }]}
              accessibilityLabel={`${prefix} ${announcement.content}`}>
              {announcement.content}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Icon
              name="open-in-new"
              color={textColor}
              width={18}
              height={18}
              style={styles.textIcon}
            />
          </View>
        </AccessibleTouchableOpacity>
      ) : (
        <View style={styles.textContainer}>
          <Text
            style={[styles.text, { color: textColor }]}
            accessibilityLabel={`${prefix} ${announcement.content}`}>
            {announcement.content}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: 'row',
  },
  iconContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    alignItems: 'flex-end',
  },
  textContainer: {
    marginLeft: 12,
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  link: {
    textDecorationLine: 'underline',
  },
  textIcon: {
    justifyContent: 'flex-end',
    marginRight: 24,
  },
  touchable: {
    minHeight: 18,
    width: '100%',
    flexDirection: 'row',
  },
});

export default connector(AnnouncementStrip);
