import React from 'react';
import {
  View,
  StyleSheet,
  Linking,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { Config } from '@config';
import { State } from '@store/types';
import {
  selectCrisis,
  selectMaintenance,
  selectFetchTimestamp,
} from '@store/announcements/selectors';
import {
  fetchAnnouncements as fetchAnnouncementsAction,
  dismissAnnouncement as dismissAnnouncementAction,
} from '@store/announcements/actions';

import {
  CRISIS_BG, CRISIS_TEXT, MAINTENANCE_BG, MAINTENANCE_TEXT
} from '@assets/colors';
import Text from '@components/common/AppText';
import AnnouncementIcon from './AnnouncementIcon';
import CloseButton from '@components/common/CloseButton';
import type { AnnouncementType } from './types';

const mapStateToProps = (state: State) => ({
  crisis: selectCrisis(state),
  maintenance: selectMaintenance(state),
  fetchTimestamp: selectFetchTimestamp(state),
});

const mapDispatchToProps = {
  fetchAnnouncements: fetchAnnouncementsAction,
  dismissAnnouncement: dismissAnnouncementAction,
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
  dismissAnnouncement,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('announcements');
  const { enabled } = Config.get('announcements');
  const { layout } = Config.get('weather');

  const announcement = type === 'crisis' ? crisis : maintenance;
  const backgroundColor = type === 'crisis' ? CRISIS_BG : MAINTENANCE_BG;
  const textColor = type === 'crisis' ? CRISIS_TEXT : MAINTENANCE_TEXT;
  const prefix = type === 'crisis' ? t('crisisPrefix') : t('maintenancePrefix');
  const paddingTop = layout === 'fmi' ? insets.top : 5;

  if (!announcement || !enabled) {
    return null;
  }

  const linkRegex = new RegExp(/^http.*$/);
  const isLink = linkRegex.test(announcement.link);

  return (
    <View style={{ backgroundColor, paddingTop }}>
      <View style={[style, styles.container]}>
        <View style={styles.iconColumn}>
          <AnnouncementIcon type={type} />
        </View>
        <View style={styles.contentColumn}>
          {isLink ? (
            <AccessibleTouchableOpacity
              style={styles.touchable}
              accessibilityRole="link"
              accessibilityHint={t('openInBrowser')}
              onPress={() => Linking.openURL(announcement.link)}>
              <View style={styles.linkTextContainer}>
                <Text
                  style={[styles.text, styles.link, { color: textColor }]}
                  accessibilityLabel={`${prefix} ${announcement.content}`}>
                  {announcement.content}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
          ) : (
            <View>
              <Text
                style={[styles.text, { color: textColor }]}
                accessibilityLabel={`${prefix} ${announcement.content}`}>
                {announcement.content}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.closeColumn}>
          {type === 'maintenance' && (
            <CloseButton
              onPress={() => dismissAnnouncement(announcement.id)}
              accessibilityLabel={t('closeAnnouncement')}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentColumn: {
    flex: 1,
    marginHorizontal: 12,
  },
  closeColumn: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    flexShrink: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  linkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  touchable: {
    minHeight: 18,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default connector(AnnouncementStrip);
